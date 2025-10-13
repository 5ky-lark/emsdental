import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if admin already exists
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (adminExists) {
      return res.status(200).json({ 
        success: true,
        message: 'Admin user already exists',
        email: adminExists.email,
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Admin user created successfully',
      email: admin.email,
      password: 'admin123',
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ 
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
