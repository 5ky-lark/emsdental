import { NextApiRequest, NextApiResponse } from 'next';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import formidable from 'formidable';
import { IncomingMessage } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = async (req: IncomingMessage): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable({ multiples: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { files } = await parseForm(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.originalFilename}`;
    const path = join(uploadsDir, filename);

    // Save the file
    await writeFile(path, await readFile(file.filepath));

    // Return the public URL that will work with our image API
    return res.status(200).json({ url: `/api/images/${filename}` });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
} 