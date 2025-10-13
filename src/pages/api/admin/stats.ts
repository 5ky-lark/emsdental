import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getSession } from 'next-auth/react';

type OrderItem = {
  quantity: number;
  product: {
    price: number;
  };
};

type Order = {
  createdAt: Date;
  items: OrderItem[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify if the user is an admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    // Get total products
    const totalProducts = await prisma.product.count();

    // Get total revenue and average order value
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalRevenue = orders.reduce((sum: number, order: Order) => {
      const orderTotal = order.items.reduce((itemSum: number, item: OrderItem) => {
        return itemSum + item.quantity * item.product.price;
      }, 0);
      return sum + orderTotal;
    }, 0);

    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Calculate sales growth (comparing current month with previous month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = now.getFullYear();
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthOrders = orders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const previousMonthOrders = orders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousYear;
    });

    const currentMonthRevenue = currentMonthOrders.reduce((sum: number, order: Order) => {
      const orderTotal = order.items.reduce((itemSum: number, item: OrderItem) => {
        return itemSum + item.quantity * item.product.price;
      }, 0);
      return sum + orderTotal;
    }, 0);

    const previousMonthRevenue = previousMonthOrders.reduce((sum: number, order: Order) => {
      const orderTotal = order.items.reduce((itemSum: number, item: OrderItem) => {
        return itemSum + item.quantity * item.product.price;
      }, 0);
      return sum + orderTotal;
    }, 0);

    const salesGrowth = previousMonthRevenue === 0
      ? 100
      : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

    return res.status(200).json({
      totalProducts,
      totalRevenue,
      averageOrderValue,
      salesGrowth: Math.round(salesGrowth * 100) / 100,
      orders: orders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        customerMobile: order.customerMobile,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 