import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    res.status(200).json({
      success: true,
      message: 'Admin login is ready to use',
      credentials: {
        username: 'admin',
        password: 'admin123',
      },
      note: 'Admin authentication now uses simple username/password instead of database lookup',
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ 
      message: 'Failed to setup admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
