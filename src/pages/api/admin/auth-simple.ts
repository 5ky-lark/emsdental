import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  console.log('Simple admin login attempt:', { username, hasPassword: !!password });

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  // Simple check
  if (username !== 'admin' || password !== 'admin123') {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Set a simple cookie
  res.setHeader('Set-Cookie', 'adminToken=simple-admin-token; Path=/; Max-Age=86400');

  console.log('Simple admin login successful');

  return res.status(200).json({
    success: true,
    user: {
      id: 'admin-user',
      username: 'admin',
      name: 'Admin User',
      role: 'admin',
    },
  });
}
