import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/router';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const router = useRouter();
  const { state, removeItem, updateQuantity } = useCart();
  const { items, total } = state;

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Shopping cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-gray-200">
                            {items.map((item) => (
                              <li key={item.id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <Image
                                    src={(() => {
                                      if (!item.image) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNiAzNkg2MFY2MEgzNlYzNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                                      
                                      // If it's already a full URL or API path, use it
                                      if (item.image.startsWith('http') || item.image.startsWith('/api/images/')) {
                                        return item.image;
                                      }
                                      
                                      // If it's an uploads path, try direct static serving first
                                      if (item.image.startsWith('/uploads/')) {
                                        return item.image;
                                      }
                                      
                                      // If it's just a filename, construct the path
                                      if (!item.image.startsWith('/')) {
                                        return `/uploads/${item.image}`;
                                      }
                                      
                                      return item.image;
                                    })()}
                                    alt={item.name}
                                    width={96}
                                    height={96}
                                    className="h-full w-full object-cover object-center"
                                    priority={true}
                                    loading="eager"
                                    unoptimized={true}
                                    quality={75}
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>{item.name}</h3>
                                      <p className="ml-4">₱{item.price.toLocaleString()}</p>
                                    </div>
                                    
                                    {/* Show selected inclusions if any */}
                                    {item.selectedInclusions && item.selectedInclusions.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-sm text-gray-600">Included items:</p>
                                        <ul className="text-sm text-gray-500 space-y-1">
                                          {item.selectedInclusions.map((inclusion, index) => (
                                            <li key={index} className="flex justify-between">
                                              <span>• {inclusion.name}</span>
                                              <span>₱{inclusion.price.toLocaleString()}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {/* Show total price for this item */}
                                    <div className="mt-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Item total:</span>
                                        <span className="font-medium">
                                          ₱{((item.price + (item.selectedInclusions?.reduce((sum, inc) => sum + inc.price, 0) || 0)) * item.quantity).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <label htmlFor={`quantity-${item.id}`} className="sr-only">
                                        Quantity
                                      </label>
                                      <select
                                        id={`quantity-${item.id}`}
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                        className="rounded-md border-gray-300 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                                      >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                          <option key={num} value={num}>
                                            {num}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.id)}
                                      className="font-medium text-primary-600 hover:text-primary-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
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
                          className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700"
                        >
                          Checkout
                        </button>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{' '}
                          <button
                            type="button"
                            className="font-medium text-primary-600 hover:text-primary-500"
                            onClick={onClose}
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 