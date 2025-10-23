import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!['GET', 'PUT', 'DELETE'].includes(req.method || '')) {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    if (req.method === 'GET') {
      // Get the product directly
      const product = await prisma.product.findUnique({
        where: {
          id: String(id),
        },
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Get the inclusions separately
      const inclusions = await prisma.productInclusion.findMany({
        where: {
          productId: String(id),
        },
      });

      // Combine the product and inclusions
      return res.status(200).json({
        ...product,
        inclusions
      });
    }

    if (req.method === 'PUT') {
      const { name, description, price, stock, image, inclusions } = req.body;

      if (!name || !description || !price || !image) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }

      // Update product
      const updatedProduct = await prisma.product.update({
        where: {
          id: String(id),
        },
        data: {
          name,
          description,
          price: Number(price),
          stock: Number(stock) || 0,
          image,
          category: 'default', // Keep the default category
        },
      });

      // Handle inclusions if provided
      if (inclusions && Array.isArray(inclusions)) {
        // Delete all existing inclusions for this product
        await prisma.productInclusion.deleteMany({
          where: {
            productId: String(id),
          },
      });

        // Create new inclusions
        const inclusionPromises = inclusions.map(inclusion => 
          prisma.productInclusion.create({
            data: {
              name: inclusion.name,
              description: inclusion.description || "",
              price: Number(inclusion.price),
              stock: Number(inclusion.stock) || 0,
              productId: String(id),
            },
          })
        );
        
        const savedInclusions = await Promise.all(inclusionPromises);

        // Return the product with inclusions
        return res.status(200).json({
          ...updatedProduct,
          inclusions: savedInclusions
        });
      }

      // If no inclusions, get existing ones
      const existingInclusions = await prisma.productInclusion.findMany({
        where: {
          productId: String(id),
        },
      });

      // Return product with existing inclusions
      return res.status(200).json({
        ...updatedProduct,
        inclusions: existingInclusions
      });
    }

    if (req.method === 'DELETE') {
      // First check if the product exists
      const product = await prisma.product.findUnique({
        where: {
          id: String(id),
        },
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Delete all inclusions for this product first
      await prisma.productInclusion.deleteMany({
        where: {
          productId: String(id),
        },
      });

      // Then delete the product
      await prisma.product.delete({
        where: {
          id: String(id),
        },
      });

      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error('Error handling product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
} 