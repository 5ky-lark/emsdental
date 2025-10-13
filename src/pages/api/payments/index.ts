import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { createCheckoutSession } from '@/lib/paymongo';

// Define the interface for a line item that matches PayMongo's expected shape
interface LineItem {
  amount: number;
  currency: string;
  description: string;
  images: string[];
  name: string;
  quantity: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { amount, orderId, items } = req.body;

    console.log('Payment request:', {
      amount,
      orderId,
      items,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      hasSecretKey: !!process.env.PAYMONGO_SECRET_KEY
    });

    if (!amount || !orderId || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get the order to verify it exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user: {
          email: session.user.email
        }
      },
      include: {
        user: true,
        items: {
          include: {
            includedItems: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get user information for the billing section
    const user = order.user;

    // Create line items for products and their inclusions as separate items
    const lineItems: LineItem[] = [];
    
    // Define a placeholder image URL to use when necessary
    const placeholderImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/placeholder-inclusion.png`;
    
    // Process each item and its inclusions
    items.forEach((item: any) => {
      // Generate product image URL
      const productImageUrl = item.image 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}${item.image}`
        : placeholderImageUrl;
      
      // Add the main product as a line item
      lineItems.push({
        amount: Math.round(item.price * 100), // Convert to cents
        currency: 'PHP',
        description: item.name,
        images: [productImageUrl],
        name: item.name,
        quantity: item.quantity,
      });
      
      // Add each inclusion as a separate line item
      if (item.selectedInclusions && item.selectedInclusions.length > 0) {
        item.selectedInclusions.forEach((inclusion: any) => {
          lineItems.push({
            amount: Math.round(inclusion.price * 100), // Convert to cents
            currency: 'PHP',
            description: `Inclusion for ${item.name}`,
            name: inclusion.name,
            quantity: item.quantity,
            images: [productImageUrl], // Use parent product's image
          });
        });
      }
      
      if (item.includedItems && item.includedItems.length > 0) {
        item.includedItems.forEach((inclusion: any) => {
          lineItems.push({
            amount: Math.round(inclusion.price * 100), // Convert to cents
            currency: 'PHP',
            description: `Inclusion for ${item.name}`,
            name: inclusion.name,
            quantity: item.quantity,
            images: [productImageUrl], // Use parent product's image
          });
        });
      }
    });

    // Create checkout session with PayMongo
    const checkoutSession = await createCheckoutSession({
      amount: Math.round(amount * 100), // Convert to cents
      description: `Order #${orderId}`,
      currency: 'PHP',
      line_items: lineItems,
      billing: {
        name: user?.name || 'Customer',
        email: user?.email || session.user.email,
        phone: '',  // PayMongo will collect this
        address: {
          line1: '',  // PayMongo will collect these address fields
          city: '',
          state: '',
          postal_code: '',
          country: 'PH',
        },
      },
      payment_method_types: ['gcash', 'card'],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?payment_intent_id={CHECKOUT_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        orderId,
        userId: order.userId,
      },
    });

    console.log('Checkout session created:', {
      id: checkoutSession.id,
      checkout_url: checkoutSession.attributes.checkout_url,
      status: checkoutSession.attributes.status
    });

    return res.status(200).json({
      data: {
        id: checkoutSession.id,
        checkout_url: checkoutSession.attributes.checkout_url,
        status: checkoutSession.attributes.status,
      }
    });
  } catch (error: any) {
    console.error('Checkout session creation error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return res.status(500).json({ 
      message: error.message || 'Failed to create checkout session',
      error: error.toString()
    });
  }
} 