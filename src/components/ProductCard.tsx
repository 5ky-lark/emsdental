import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { Product } from '@/types';
import { CartItem } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const { addItem } = useCart();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      setIsLoading(true);
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: getImageUrl(),
      };
      addItem(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the correct image URL with better fallback handling
  const getImageUrl = () => {
    // Check for single image field (from API)
    if (product.image) {
      const singleImage = product.image;
      
      // If it's already a full URL or API path, use it
      if (singleImage.startsWith('http') || singleImage.startsWith('/api/images/')) {
        return singleImage;
      }
      
      // If it's an uploads path, try both API route and direct static serving
      if (singleImage.startsWith('/uploads/')) {
        return singleImage; // Try direct static serving first
      }
      
      // If it's just a filename, construct the path
      if (!singleImage.startsWith('/')) {
        return `/uploads/${singleImage}`;
      }
      
      return singleImage;
    }
    
    // Fallback to images array (for backward compatibility)
    if (Array.isArray((product as any).images) && (product as any).images[0]) {
      const imageUrl = (product as any).images[0];
      
      if (imageUrl.startsWith('http') || imageUrl.startsWith('/api/images/')) {
        return imageUrl;
      }
      
      if (imageUrl.startsWith('/uploads/')) {
        return imageUrl;
      }
      
      if (!imageUrl.startsWith('/')) {
        return `/uploads/${imageUrl}`;
      }
      
      return imageUrl;
    }
    
    // Return a simple placeholder data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
  };

  const imageUrl = imageError ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K' : getImageUrl();

  return (
    <>
      <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden max-w-[400px] w-full transition-all duration-300 hover:-translate-y-2 border border-gray-100">
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative w-full h-[280px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              className="group-hover:scale-105 transition-transform duration-500"
              priority={false}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              onError={() => setImageError(true)}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Quick view button */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        </Link>
        <div className="p-5 space-y-3">
          <Link href={`/products/${product.id}`} className="block group">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">{product.name}</h3>
          </Link>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{product.description}</p>
          
          {/* Enhanced Stock Display */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : product.stock > 0 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
            
            {/* Category Badge */}
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {product.category || 'Dental Equipment'}
            </span>
          </div>
          
          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex flex-col">
              <p className="text-2xl font-bold text-gray-900">₱{product.price.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Free shipping</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isLoading || product.stock === 0}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-300 ${
                product.stock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 focus-visible:outline-blue-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {product.stock === 0 ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Out of Stock</span>
                </>
              ) : isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                  </svg>
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 