import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const inquiries = await prisma.inquiry.findMany();
      res.status(200).json(inquiries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 