import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';

export default function PaymentSuccess() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const { payment_intent_id } = router.query;

    if (!payment_intent_id) {
      setError('Payment information not found');
      setLoading(false);
      return;
    }

    // Verify the payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payments/verify?payment_intent_id=${payment_intent_id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to verify payment');
        }

        // Redirect to order page or show success message
        if (data.status === 'succeeded') {
          router.push(`/orders/${data.orderId}`);
        } else {
          setError('Payment verification failed');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [router, session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/checkout')}
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Return to Checkout
          </button>
        </div>
      </div>
    );
  }

  return null;
} 