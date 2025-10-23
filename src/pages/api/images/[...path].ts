import { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { path } = req.query;
    
    if (!path || !Array.isArray(path)) {
      return res.status(400).json({ message: 'Invalid path' });
    }

    const imagePath = join(process.cwd(), 'public', 'uploads', ...path);
    
    // Check if file exists
    if (!existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Read the file
    const fileBuffer = await readFile(imagePath);
    
    // Get file extension to determine content type
    const ext = path[path.length - 1].split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg';
    
    switch (ext) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'avif':
        contentType = 'image/avif';
        break;
      default:
        contentType = 'image/jpeg';
    }

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Send the file
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image' });
  }
}
