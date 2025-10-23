import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all products
        const products = await prisma.product.findMany();
        
        // Get all product inclusions
        const productIds = products.map(product => product.id);
        const allInclusions = await prisma.productInclusion.findMany({
          where: {
            productId: {
              in: productIds,
            },
          },
        });
        
        // Group inclusions by product ID
        const inclusionsByProduct = allInclusions.reduce((acc, inclusion) => {
          if (!acc[inclusion.productId]) {
            acc[inclusion.productId] = [];
          }
          acc[inclusion.productId].push(inclusion);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Add inclusions to products
        const productsWithInclusions = products.map(product => ({
          ...product,
          inclusions: inclusionsByProduct[product.id] || [],
        }));
        
        return res.status(200).json(productsWithInclusions);

      case 'POST':
        const { name, description, price, stock, image, inclusions } = req.body;

        if (!name || !description || !price || !image) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields' 
          });
        }

        // Create the product
        const newProduct = await prisma.product.create({
          data: {
            name,
            description,
            price: Number(price),
            stock: Number(stock) || 0,
            image,
            category: 'default', // Set a default category since it's required by the schema
          },
        });

        // Create inclusions if provided
        let productInclusions: any[] = [];
        if (inclusions && Array.isArray(inclusions) && inclusions.length > 0) {
          const inclusionPromises = inclusions.map(inclusion => 
            prisma.productInclusion.create({
              data: {
                name: inclusion.name,
                description: inclusion.description || "",
                price: Number(inclusion.price),
                stock: Number(inclusion.stock) || 0,
                productId: newProduct.id,
              },
            })
          );
          
          productInclusions = await Promise.all(inclusionPromises);
        }

        return res.status(201).json({
          ...newProduct,
          inclusions: productInclusions
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in products API:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
} 