declare module 'paymongo' {
  interface PaymongoConfig {
    secretKey: string;
    publicKey: string;
  }

  interface PaymentIntentCreateParams {
    amount: number;
    currency: string;
    payment_method_types: string[];
    description?: string;
  }

  interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
  }

  class Paymongo {
    constructor(config: PaymongoConfig);
    paymentIntents: {
      create(params: PaymentIntentCreateParams): Promise<PaymentIntent>;
      retrieve(id: string): Promise<PaymentIntent>;
    };
  }

  export default Paymongo;
} 