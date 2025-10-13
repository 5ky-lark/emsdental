import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export async function isAuthenticated(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    (req as any).user = user;
    await next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function isAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add user to request object
    (req as any).user = user;
    await next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
} 