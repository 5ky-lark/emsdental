import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import Head from 'next/head';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { state, removeItem, updateQuantity } = useCart();
  const { items, total } = state;

  const handleCheckout = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Your Cart - Dental Equipment</title>
        </Head>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-gray-900">Your Cart</h1>
              <p className="mt-4 text-lg text-gray-500">Your cart is empty</p>
              <button
                onClick={() => router.push('/products')}
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Your Cart - Dental Equipment</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Cart</h1>

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            <div className="lg:col-span-7">
              <ul role="list" className="border-t border-b border-gray-200 divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-md overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-center object-cover"
                        />
                      </div>
                    </div>

                    <div className="ml-4 flex-1 flex flex-col sm:ml-6">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <p className="ml-4 text-sm font-medium text-gray-900">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">₱{item.price.toLocaleString()} each</p>
                      </div>

                      <div className="mt-4 flex-1 flex items-end justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <FiMinus className="h-4 w-4" />
                          </button>
                          <span className="mx-2 text-gray-500">Qty {item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <FiPlus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                <div className="mt-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>₱{total.toLocaleString()}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Checkout
                    </button>
                  </div>
                  <div className="mt-6 text-center text-sm">
                    <button
                      onClick={() => router.push('/products')}
                      className="text-primary-600 font-medium hover:text-primary-500"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 