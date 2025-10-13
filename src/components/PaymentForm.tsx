import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCreditCard, FiMail, FiAlertCircle } from 'react-icons/fi';
import Image from 'next/image';

interface PaymentFormProps {
  amount: number;
  description?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: any) => void;
}

export default function PaymentForm({
  amount,
  description,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          ...data,
        }),
      });

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse API response:', e);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(
          result.details || result.error || 'Payment failed'
        );
      }

      window.location.href = `https://payments.paymongo.com/payment/${result.paymentIntentId}`;
      onSuccess?.(result.paymentIntentId);
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
        <p className="text-gray-600 mt-2">{description || 'Complete your payment'}</p>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-2xl font-bold text-gray-900">₱{amount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <FiAlertCircle className="mr-1" />
              {errors.email.message as string}
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Available Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiCreditCard className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Credit/Debit Card</span>
            </div>
            <div className="flex items-center">
              <Image
                src="/gcash-logo.svg"
                alt="GCash"
                width={20}
                height={20}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">GCash</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Payment Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Pay Now'
          )}
        </button>

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>Secure payment powered by PayMongo</p>
          <p className="mt-1">Your payment information is encrypted and secure</p>
        </div>
      </form>
    </div>
  );
} 