'use client';

import PaymentForm from '@/components/PaymentForm';
import { useState } from 'react';

export default function TestPaymentPage() {
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentStatus(`Payment successful! Payment ID: ${paymentId}`);
  };

  const handlePaymentError = (error: any) => {
    setPaymentStatus(`Payment failed: ${error.message}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-8">Test Payment</h1>
        
        <PaymentForm
          amount={100} // Test amount: ₱100
          description="Test payment for dental services"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        {paymentStatus && (
          <div className="mt-4 p-4 rounded-md bg-gray-50">
            <p className="text-sm text-gray-700">{paymentStatus}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <h2 className="font-semibold mb-2">Test Card Details:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Card Number: 4242 4242 4242 4242</li>
            <li>Expiry: Any future date</li>
            <li>CVV: Any 3 digits</li>
            <li>PIN: Any 6 digits</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 