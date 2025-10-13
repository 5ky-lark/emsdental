import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Head from 'next/head';
import { CartItem, SelectedInclusion } from '@/types/product';
import { CheckCircleIcon, ChevronRightIcon, UserIcon, MapPinIcon, PhoneIcon, HashtagIcon } from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { state, clearCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    mobile: '',
    zipCode: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle redirects and payment verification
  useEffect(() => {
    if (!isClient) return;

    // Handle payment verification first
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const payment_intent_id = params.get('payment_intent_id');
      const order_id = params.get('order_id');

      if (payment_intent_id && order_id) {
        try {
          const response = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user?.id}`
            },
            body: JSON.stringify({ payment_intent_id, order_id }),
          });

          if (!response.ok) {
            throw new Error('Payment verification failed');
          }

          const { success, orderId } = await response.json();

          if (success) {
            clearCart();
            router.push(`/orders/${orderId}`);
            return;
          }
        } catch (error: any) {
          console.error('Payment verification error:', error);
          setError(error.message || 'Failed to verify payment');
          // Redirect to home page on error
          router.push('/');
          return;
        }
      }

      // Only check authentication if we're not verifying a payment
      if (status === 'unauthenticated' && !payment_intent_id) {
        router.push('/');
        return;
      }

      // Handle empty cart redirect
      if (status === 'authenticated' && state.items.length === 0 && !payment_intent_id) {
        router.push('/');
        return;
      }
    };

    verifyPayment();
  }, [isClient, status, state.items.length, router, clearCart, session]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!customerInfo.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!customerInfo.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!customerInfo.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^(\+63|0)?9\d{9}$/.test(customerInfo.mobile.replace(/\s/g, ''))) {
      errors.mobile = 'Please enter a valid Philippine mobile number';
    }
    
    if (!customerInfo.zipCode.trim()) {
      errors.zipCode = 'Zip code is required';
    } else if (!/^\d{4}$/.test(customerInfo.zipCode.trim())) {
      errors.zipCode = 'Please enter a valid 4-digit zip code';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items,
          paymentInfo: { method: 'gcash' },
          total: state.total,
          customerInfo: customerInfo,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const { data: order } = await orderResponse.json();

      // Create checkout session
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: state.total,
          orderId: order.id,
          items: state.items,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { data } = await paymentResponse.json();

      // Redirect to PayMongo hosted checkout
      window.location.href = data.checkout_url;
    } catch (error: any) {
      setError(error.message || 'Failed to process checkout');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication or during SSR
  if (!isClient || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Don't render the page if not authenticated or cart is empty
  if (status === 'unauthenticated' || state.items.length === 0) {
    router.push('/');
    return null;
  }

  // Get subtotal (products without inclusions)
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Get inclusions total
  const inclusionsTotal = state.items.reduce((sum, item) => {
    let itemInclusionsTotal = 0;
    
    if (item.selectedInclusions && item.selectedInclusions.length > 0) {
      itemInclusionsTotal = item.selectedInclusions.reduce((iSum, inclusion) => 
        iSum + inclusion.price, 0) * item.quantity;
    }
    
    if (item.includedItems && item.includedItems.length > 0) {
      itemInclusionsTotal = item.includedItems.reduce((iSum, inclusion) => 
        iSum + inclusion.price, 0) * item.quantity;
    }
    
    return sum + itemInclusionsTotal;
  }, 0);

  return (
    <>
      <Head>
        <title>Checkout | Dental Chairs</title>
        <meta name="description" content="Complete your purchase of dental chairs and equipment" />
      </Head>
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-2 text-gray-500">Review your order and proceed to payment</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            {/* Customer Information */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="inline h-4 w-4 mr-1" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    value={customerInfo.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.mobile ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 09123456789"
                  />
                  {formErrors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.mobile}</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="inline h-4 w-4 mr-1" />
                    Complete Address *
                  </label>
                  <textarea
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your complete address"
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>

                {/* Zip Code */}
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    <HashtagIcon className="inline h-4 w-4 mr-1" />
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    value={customerInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.zipCode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 1234"
                    maxLength={4}
                  />
                  {formErrors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Order Summary */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
                  {state.items.map((item: CartItem) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                        width={80}
                        height={80}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                    <div className="ml-6 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="ml-4 text-lg font-medium text-gray-900">
                          ₱{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                      
                      {/* Inclusions */}
                      {(item.selectedInclusions && item.selectedInclusions.length > 0) || 
                       (item.includedItems && item.includedItems.length > 0) ? (
                        <div className="mt-4 bg-neutral-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Included Items:</h4>
                          <ul className="space-y-2">
                            {item.selectedInclusions?.map((inclusion: SelectedInclusion) => (
                              <li key={inclusion.inclusionId} className="flex justify-between text-sm">
                                <div className="flex items-center">
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                  <span>{inclusion.name}</span>
                          </div>
                                <span className="font-medium">₱{inclusion.price.toLocaleString()}</span>
                              </li>
                            ))}
                            {item.includedItems?.map((inclusion) => (
                              <li key={inclusion.id} className="flex justify-between text-sm">
                                <div className="flex items-center">
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                  <span>{inclusion.name}</span>
                        </div>
                                <span className="font-medium">₱{inclusion.price.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="bg-gray-50 p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium text-gray-900">₱{subtotal.toLocaleString()}</p>
                  </div>
                {inclusionsTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Inclusions</p>
                    <p className="font-medium text-gray-900">₱{inclusionsTotal.toLocaleString()}</p>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-base font-medium">
                    <p className="text-gray-900">Total</p>
                    <p className="text-gray-900">₱{state.total.toLocaleString()}</p>
                  </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                  onClick={handleCheckout}
                    disabled={isLoading}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Processing...' : (
                    <>
                      Proceed to Payment
                      <ChevronRightIcon className="ml-2 h-5 w-5" />
                    </>
                  )}
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 