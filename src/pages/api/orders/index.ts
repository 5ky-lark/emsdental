import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { Order, OrderItem, CartItem } from '@/types/product';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  console.log('Session data:', {
    hasSession: !!session,
    userEmail: session?.user?.email,
    userId: session?.user?.id
  });

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { items, paymentInfo, total, customerInfo } = req.body;

      if (!items || !paymentInfo || !total) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate customer information
      if (!customerInfo || !customerInfo.name || !customerInfo.address || !customerInfo.mobile || !customerInfo.zipCode) {
        return res.status(400).json({ message: 'Customer information is required' });
      }

      // Check that all product IDs exist in the database
      const missingProducts: string[] = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.id } });
        if (!product) {
          missingProducts.push(item.id);
        }
      }
      if (missingProducts.length > 0) {
        return res.status(400).json({ message: `The following products are no longer available (by ID): ${missingProducts.join(', ')}` });
      }

      // Create the order with items
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          customerName: customerInfo.name,
          customerAddress: customerInfo.address,
          customerMobile: customerInfo.mobile,
          customerZipCode: customerInfo.zipCode,
          shippingInfo: "{}",  // Empty object as PayMongo will collect shipping info
          paymentInfo: JSON.stringify(paymentInfo),
          total: total,
          status: 'pending',
          items: {
            create: await Promise.all(items.map(async (item: CartItem) => {
              // Find the product by ID
              const product = await prisma.product.findUnique({ where: { id: item.id } });
              if (!product) {
                throw new Error(`Product not found: ${item.id}`);
              }

              // Create an order item first
              const orderItem = {
                product: {
                  connect: {
                    id: product.id
                  }
                },
                quantity: item.quantity,
                price: item.price,
              };

              return orderItem;
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
        },
      });

      // Handle product inclusions after order creation
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const orderItem = order.items[i];
        
        // Add inclusions if they exist
        if (orderItem && (item.selectedInclusions?.length > 0 || item.includedItems?.length > 0)) {
          const inclusions = item.selectedInclusions || item.includedItems || [];
          
          for (const inclusion of inclusions) {
            await prisma.orderItemInclusion.create({
              data: {
                orderItemId: orderItem.id,
                name: inclusion.name,
                description: inclusion.description || "",
                price: inclusion.price,
              }
            });
          }
        }
      }

      // Get the updated order with inclusions
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true,
              includedItems: true
            }
          },
        },
      });

      console.log('Order created:', {
        orderId: order.id,
        userId: order.userId,
        total: order.total
      });

      return res.status(201).json({ data: updatedOrder });
    } catch (error: any) {
      console.error('Order creation error:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          items: {
            include: {
              product: true,
              includedItems: true
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json({ data: orders });
    } catch (error: any) {
      console.error('Order retrieval error:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 