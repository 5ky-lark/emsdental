import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'This endpoint is only available in development mode' });
  }

  try {
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!admin) {
      // Create new admin if none exists
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          name: 'Admin User',
        },
      });
      
      return res.status(200).json({
        success: true,
        message: 'Admin user created successfully',
        email: newAdmin.email,
      });
    }

    // Update existing admin
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const updatedAdmin = await prisma.user.update({
      where: { id: admin.id },
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Admin credentials updated successfully',
      email: updatedAdmin.email,
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
} 