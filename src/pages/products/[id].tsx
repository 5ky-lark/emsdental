import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { Product, ProductInclusion } from '@/types/product';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const { addItem } = useCart();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInclusions, setSelectedInclusions] = useState<Record<string, boolean>>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Fetch product data
  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          // Ensure features is always an array
          const productData = {
            ...data,
            features: data.features || [],
            inclusions: data.inclusions || []
          };
          setProduct(productData);
          
          // Initialize all inclusions as selected by default
          const initialInclusions: Record<string, boolean> = {};
          if (productData.inclusions && productData.inclusions.length > 0) {
            productData.inclusions.forEach((inclusion: ProductInclusion) => {
              initialInclusions[inclusion.id] = true;
            });
          }
          setSelectedInclusions(initialInclusions);
          
          // Calculate initial total price
          calculateTotalPrice(productData, initialInclusions, quantity);
        })
        .catch(error => {
          console.error('Error fetching product:', error);
          setError('Failed to load product details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const calculateTotalPrice = (
    prod: Product | null, 
    inclusions: Record<string, boolean>, 
    qty: number
  ) => {
    if (!prod) return;
    
    let price = prod.price;
    
    // Add the price of selected inclusions
    if (prod.inclusions && prod.inclusions.length > 0) {
      prod.inclusions.forEach(inclusion => {
        if (inclusions[inclusion.id]) {
          price += inclusion.price;
        }
      });
    }
    
    setTotalPrice(price * qty);
  };

  // Recalculate price when selections or quantity changes
  useEffect(() => {
    calculateTotalPrice(product, selectedInclusions, quantity);
  }, [selectedInclusions, quantity, product]);

  const toggleInclusion = (inclusionId: string) => {
    setSelectedInclusions(prev => ({
      ...prev,
      [inclusionId]: !prev[inclusionId]
    }));
  };

  const handleAddToCart = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (product) {
      setIsLoading(true);
      try {
        // Get only the selected inclusions as a simplified format
        // The actual CartItemInclusion will be created on the server
        const selectedInclusionsData = product.inclusions
          ?.filter(inclusion => selectedInclusions[inclusion.id])
          .map(inclusion => ({
            inclusionId: inclusion.id,
            name: inclusion.name,
            description: inclusion.description,
            price: inclusion.price
          }));
          
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: (product as any).image || (Array.isArray(product.images) && product.images[0]) || '/images/placeholder.jpg',
          selectedInclusions: selectedInclusionsData
        });
        // Optional: Show success message or redirect to cart
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {error || 'Product not found'}
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
        <title>{product.name} - Dental Equipment</title>
      </Head>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            {/* Product image */}
            <div className="lg:max-w-lg lg:self-end">
              <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                <Image
                  src={(() => {
                    const image = (product as any).image || (Array.isArray(product.images) && product.images[0]);
                    if (!image) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwSDMwMFYzMDBIMjAwVjIwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                    
                    // If it's already a full URL or API path, use it
                    if (image.startsWith('http') || image.startsWith('/api/images/')) {
                      return image;
                    }
                    
                    // If it's an uploads path, try direct static serving first
                    if (image.startsWith('/uploads/')) {
                      return image;
                    }
                    
                    // If it's just a filename, construct the path
                    if (!image.startsWith('/')) {
                      return `/uploads/${image}`;
                    }
                    
                    return image;
                  })()}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-center object-cover"
                />
              </div>
            </div>

            {/* Product details */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {product.name}
              </h1>
              <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl text-gray-900">
                  ₱{product.price.toLocaleString()}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <div className="text-base text-gray-700 space-y-6">
                  <p>{product.description}</p>
                </div>
              </div>

              {/* Stock Display */}
              <div className="mt-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">Stock:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : product.stock > 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">Features</h3>
                  <div className="mt-4">
                    <ul role="list" className="list-disc pl-4 space-y-2">
                      {product.features.map((feature) => (
                        <li key={feature} className="text-sm text-gray-600">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Product Inclusions Section */}
              {product.inclusions && product.inclusions.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900">Included Equipment</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Select or deselect equipment to customize your product:
                  </p>
                  
                  <div className="mt-4 space-y-4">
                    {product.inclusions.map((inclusion) => (
                      <div 
                        key={inclusion.id} 
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedInclusions[inclusion.id] 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleInclusion(inclusion.id)}
                      >
                        <div className="flex-shrink-0 pt-0.5">
                          <CheckCircleIcon 
                            className={`h-5 w-5 ${
                              selectedInclusions[inclusion.id] 
                                ? 'text-primary-600' 
                                : 'text-gray-300'
                            }`} 
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{inclusion.name}</h4>
                            <p className="text-sm font-medium text-gray-900">₱{inclusion.price.toLocaleString()}</p>
                          </div>
                          {inclusion.description && (
                            <p className="mt-1 text-sm text-gray-500">{inclusion.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="p-2 text-gray-400 hover:text-gray-500"
                    >
                      <FiMinus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-gray-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-gray-400 hover:text-gray-500"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Price */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Total Price</h3>
                  <p className="text-2xl font-bold text-gray-900">₱{totalPrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isLoading || product.stock === 0}
                  className={`w-full border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    product.stock === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                  } disabled:opacity-50`}
                >
                  {product.stock === 0 
                    ? 'Out of Stock' 
                    : isLoading 
                    ? 'Adding to Cart...' 
                    : 'Add to Cart'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 