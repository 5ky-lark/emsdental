import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { verifyPayment } from '@/lib/paymongo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { payment_intent_id, order_id } = req.body;

    if (!payment_intent_id || !order_id) {
      return res.status(400).json({ message: 'Missing payment_intent_id or order_id' });
    }

    // Verify the payment with PayMongo
    const payment = await verifyPayment(payment_intent_id);

    if (!payment) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: order_id },
      data: {
        status: 'paid',
        paymentInfo: JSON.stringify({
          status: 'paid',
          paymentIntentId: payment_intent_id,
          verifiedAt: new Date().toISOString()
        })
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Decrement stock for each product in the order
    for (const item of updatedOrder.items) {
      if (item.productId && typeof item.quantity === 'number') {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      orderId: updatedOrder.id,
      status: updatedOrder.status
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to verify payment',
      error: error.toString()
    });
  }
} 