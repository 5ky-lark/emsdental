import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { withAdminAccess } from '@/lib/rbac';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    lowStockProducts: number;
  };
  salesData: {
    daily: Array<{ date: string; revenue: number; orders: number }>;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: Date;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get overview statistics
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.product.count(),
      prisma.product.count({
        where: { stock: { lt: 10 } },
      }),
    ]);

    // Get daily sales data
    const dailySales = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { total: true },
      _count: { id: true },
    });

    // Get monthly sales data (last 12 months)
    const monthlySales = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;

    // Get top products by sales
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, price: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          id: item.productId,
          name: product?.name || 'Unknown Product',
          sales: item._sum.quantity || 0,
          revenue: (item._sum.price || 0) * (item._sum.quantity || 0),
        };
      })
    );

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });

    // Get user growth data
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*) as users
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `;

    // Format daily sales data
    const formattedDailySales = dailySales.map(sale => ({
      date: sale.createdAt.toISOString().split('T')[0],
      revenue: sale._sum.total || 0,
      orders: sale._count.id,
    }));

    // Format monthly sales data
    const formattedMonthlySales = (monthlySales as any[]).map(sale => ({
      month: new Date(sale.month).toISOString().slice(0, 7),
      revenue: parseFloat(sale.revenue) || 0,
      orders: parseInt(sale.orders) || 0,
    }));

    // Format user growth data
    const formattedUserGrowth = (userGrowth as any[]).map(growth => ({
      date: new Date(growth.date).toISOString().split('T')[0],
      users: parseInt(growth.users) || 0,
    }));

    const analyticsData: AnalyticsData = {
      overview: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
        lowStockProducts,
      },
      salesData: {
        daily: formattedDailySales,
        monthly: formattedMonthlySales,
      },
      topProducts: topProductsWithDetails,
      recentOrders,
      userGrowth: formattedUserGrowth,
    };

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
}

export default withAdminAccess(handler);
