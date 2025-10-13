import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadFile(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name}`;
    const path = join(process.cwd(), 'public', 'uploads', filename);

    // Ensure the uploads directory exists
    await writeFile(path, buffer);

    // Return the public URL for the uploaded file
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
} 