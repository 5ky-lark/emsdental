import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    console.log('Admin login attempt:', { username, hasPassword: !!password });

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // For admin login, we'll use a simple username check
    // Username: admin, Password: admin123
    if (username !== 'admin' || password !== 'admin123') {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create a mock admin user object for the session
    const adminUser = {
      id: 'admin-user',
      username: 'admin',
      name: 'Admin User',
      role: 'admin',
    };

    // Create admin-specific token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-admin';
    const token = jwt.sign(
      { 
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        isAdmin: true 
      },
      jwtSecret,
      { expiresIn: '1d' }
    );

    // Set admin token cookie
    const cookieOptions = [
      `adminToken=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=86400'
    ];
    
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure');
    }
    
    res.setHeader('Set-Cookie', cookieOptions.join('; '));

    return res.status(200).json({
      success: true,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 