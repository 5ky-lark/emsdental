import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  console.log('Order details API session:', {
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    method: req.method,
    orderId: req.query.id
  });

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid order ID' });
  }

  switch (req.method) {
    case 'GET':
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      console.log('Order fetch result:', {
        found: !!order,
        orderUserId: order?.userId,
        sessionUserId: user.id,
        userRole: user.role
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Only allow users to view their own orders (except for admins)
      if (order.userId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return res.json({ success: true, data: order });

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 