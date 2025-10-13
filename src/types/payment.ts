export interface PaymentIntentData {
  amount: number;
  currency: string;
  payment_method_types: string[];
  description: string;
}

export interface PaymentIntent {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    description: string;
    status: string;
    payment_method_types: string[];
    metadata: Record<string, any>;
    checkout_url: string;
    created_at: number;
    updated_at: number;
  };
}

export interface PaymentVerification {
  paymentIntentId: string;
  orderId: string;
  status: 'succeeded' | 'failed';
  error?: string;
} 