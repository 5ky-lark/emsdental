import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if admin exists
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!admin) {
      // Create admin user
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
        message: 'Admin user created successfully',
        email: newAdmin.email,
        password: 'Admin@123', // Only for initial setup
      });
    }

    return res.status(200).json({
      message: 'Admin user exists',
      email: admin.email,
    });
  } catch (error) {
    console.error('Verify admin error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 