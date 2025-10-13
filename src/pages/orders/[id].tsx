import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Head from 'next/head';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  customerName?: string;
  customerAddress?: string;
  customerMobile?: string;
  customerZipCode?: string;
  shippingInfo: string;
  paymentInfo: string;
}

export default function OrderConfirmation() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (id) {
      fetch(`/api/orders/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setOrder(data.data);
          } else {
            throw new Error(data.message || 'Failed to fetch order');
          }
        })
        .catch(error => {
          console.error('Error fetching order:', error);
          setError('Failed to load order details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {error || 'Order not found'}
          </h1>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 text-primary-600 hover:text-primary-500"
          >
            Return to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Order Confirmation - Dental Equipment</title>
      </Head>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Thank you for your order!
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                Your order has been placed successfully.
              </p>
            </div>

            <div className="mt-12">
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
                <dl className="mt-4 space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Order number</dt>
                    <dd className="text-sm font-medium text-gray-900">{order.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Customer</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {order.customerName || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Mobile</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {order.customerMobile || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                    <dd className="text-sm font-medium text-gray-900 text-right">
                      {order.customerAddress || 'N/A'}<br />
                      Zip Code: {order.customerZipCode || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ₱{order.total.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      GCash
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
                <ul role="list" className="mt-4 divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <li key={item.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ₱{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 