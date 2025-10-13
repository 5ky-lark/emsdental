import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  switch (req.method) {
    case 'GET':
      return res.json(cart);

    case 'POST':
      const { productId, quantity = 1, selectedInclusions = [] } = req.body;

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if item already exists in cart
      const existingItem = cart.items.find(item => item.productId === productId);

      if (existingItem) {
        // Update quantity
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
        
        // Handle selected inclusions if provided
        if (selectedInclusions.length > 0) {
          // Remove existing inclusions for this cart item
          await prisma.cartItemInclusion.deleteMany({
            where: { cartItemId: existingItem.id }
          });
          
          // Add new inclusions
          for (const inclusion of selectedInclusions) {
            await prisma.cartItemInclusion.create({
              data: {
                cartItemId: existingItem.id,
                name: inclusion.name,
                description: inclusion.description || '',
                price: inclusion.price,
              }
            });
          }
        }
      } else {
        // Add new item
        const newCartItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
        
        // Add inclusions if provided
        if (selectedInclusions.length > 0) {
          for (const inclusion of selectedInclusions) {
            await prisma.cartItemInclusion.create({
              data: {
                cartItemId: newCartItem.id,
                name: inclusion.name,
                description: inclusion.description || '',
                price: inclusion.price,
              }
            });
          }
        }
      }

      // Return updated cart
      const updatedCart = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true,
              includedItems: true,
            },
          },
        },
      });

      return res.json(updatedCart);

    case 'DELETE':
      const { itemId } = req.body;

      if (!itemId) {
        return res.status(400).json({ message: 'Item ID is required' });
      }

      await prisma.cartItem.delete({
        where: { id: itemId },
      });

      // Return updated cart
      const cartAfterDelete = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return res.json(cartAfterDelete);

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 