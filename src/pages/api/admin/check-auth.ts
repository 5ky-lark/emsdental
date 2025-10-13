import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const adminToken = req.cookies.adminToken;

    if (!adminToken) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify the token
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(adminToken, secret) as { isAdmin: boolean };

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.status(200).json({ authenticated: true });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(401).json({ message: 'Not authenticated' });
  }
} 