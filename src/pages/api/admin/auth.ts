import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // Create a simple admin token (base64 encoded for now)
    const tokenData = {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      isAdmin: true,
      timestamp: Date.now()
    };
    
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

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

    console.log('Admin login successful, token created');

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
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 