import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { withManagerAccess } from '@/lib/rbac';
import { sendLowStockAlert } from '@/lib/email';

interface InventoryData {
  products: Array<{
    id: string;
    name: string;
    category: string;
    stock: number;
    price: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    lastUpdated: Date;
  }>;
  lowStockAlerts: Array<{
    id: string;
    name: string;
    stock: number;
    category: string;
  }>;
  summary: {
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { lowStock = '10' } = req.query;
      const lowStockThreshold = parseInt(lowStock as string);

      // Get all products with stock information
      const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          category: true,
          stock: true,
          price: true,
          updatedAt: true,
        },
      });

      // Categorize products by stock status
      const categorizedProducts = products.map(product => {
        let status: 'in_stock' | 'low_stock' | 'out_of_stock';
        
        if (product.stock === 0) {
          status = 'out_of_stock';
        } else if (product.stock <= lowStockThreshold) {
          status = 'low_stock';
        } else {
          status = 'in_stock';
        }

        return {
          ...product,
          status,
          lastUpdated: product.updatedAt,
        };
      });

      // Get low stock alerts
      const lowStockAlerts = products
        .filter(product => product.stock <= lowStockThreshold)
        .map(product => ({
          id: product.id,
          name: product.name,
          stock: product.stock,
          category: product.category,
        }));

      // Calculate summary statistics
      const summary = {
        totalProducts: products.length,
        inStock: categorizedProducts.filter(p => p.status === 'in_stock').length,
        lowStock: categorizedProducts.filter(p => p.status === 'low_stock').length,
        outOfStock: categorizedProducts.filter(p => p.status === 'out_of_stock').length,
        totalValue: products.reduce((sum, product) => sum + (product.price * product.stock), 0),
      };

      const inventoryData: InventoryData = {
        products: categorizedProducts,
        lowStockAlerts,
        summary,
      };

      res.status(200).json(inventoryData);
    } catch (error) {
      console.error('Inventory fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch inventory data' });
    }
  } else if (req.method === 'PUT') {
    // Update product stock
    try {
      const { productId, stock, sendAlert = false } = req.body;

      if (!productId || stock === undefined) {
        return res.status(400).json({ error: 'Product ID and stock are required' });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { stock: parseInt(stock) },
      });

      // Send low stock alert if requested and stock is low
      if (sendAlert && updatedProduct.stock <= 10) {
        const adminUsers = await prisma.user.findMany({
          where: { role: { in: ['admin', 'super_admin'] } },
          select: { email: true },
        });

        const adminEmails = adminUsers.map(user => user.email);
        if (adminEmails.length > 0) {
          await sendLowStockAlert(updatedProduct, adminEmails[0]);
        }
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Inventory update error:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withManagerAccess(handler);
