import { PaymentIntent } from '@/types/payment';

export interface CheckoutSession {
  id: string;
  type: string;
  attributes: {
    checkout_url: string;
    client_key: string;
    status: string;
    // ...other fields
  };
}

interface CreateCheckoutSessionParams {
  amount: number;
  description: string;
  currency: string;
  line_items: Array<{
    amount: number;
    currency: string;
    description: string;
    images: string[];
    name: string;
    quantity: number;
  }>;
  billing: {
    name: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  payment_method_types: string[];
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
}

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession> {
  if (!PAYMONGO_SECRET_KEY) throw new Error('PayMongo secret key is not configured');

  const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    },
    body: JSON.stringify({ data: { attributes: params } }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.errors?.[0]?.detail || 'Failed to create checkout session');
  }
  return responseData.data;
}

export async function verifyPayment(paymentIntentId: string): Promise<boolean> {
  if (!PAYMONGO_SECRET_KEY) {
    throw new Error('PayMongo secret key is not configured');
  }

  try {
    console.log('Verifying payment intent:', paymentIntentId);

    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
      },
    });

    const responseData = await response.json();
    console.log('PayMongo verification response:', responseData);

    if (!response.ok) {
      console.error('PayMongo verification error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      throw new Error(responseData.errors?.[0]?.detail || 'Failed to verify payment');
    }

    if (!responseData.data) {
      console.error('Invalid PayMongo verification response:', responseData);
      throw new Error('Invalid response from PayMongo');
    }

    return responseData.data.attributes.status === 'succeeded';
  } catch (error: any) {
    console.error('PayMongo verification error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    throw new Error(error.message || 'Failed to verify payment');
  }
} 