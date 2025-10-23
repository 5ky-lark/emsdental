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

  // Get the correct image URL
  const getImageUrl = () => {
    // Check for single image field first (from API)
    if ((product as any).image) {
      const singleImage = (product as any).image;
      if (singleImage.startsWith('/') || singleImage.startsWith('http')) {
        return singleImage;
      } else {
        return singleImage; // API already returns full path
      }
    }
    
    // Fallback to images array
    if (Array.isArray(product.images) && product.images[0]) {
      if (product.images[0].startsWith('/') || product.images[0].startsWith('http')) {
        return product.images[0];
      } else {
        return '/images/' + product.images[0];
      }
    }
    
    // Return a simple placeholder data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
  };

  const imageUrl = imageError ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K' : getImageUrl();

  return (
    <>
      <div className="group relative bg-white rounded-lg shadow-md overflow-hidden max-w-[400px]">
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative w-full h-[250px] bg-gray-100 rounded-t-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              className="group-hover:opacity-75 transition-opacity duration-300"
              priority={false}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              onError={() => setImageError(true)}
            />
          </div>
        </Link>
        <div className="p-4">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
          </Link>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
          
          {/* Stock Display */}
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock > 0 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-medium text-gray-900">₱{product.price.toLocaleString()}</p>
            <button
              onClick={handleAddToCart}
              disabled={isLoading || product.stock === 0}
              className={`rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                product.stock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-600'
              } disabled:opacity-50`}
            >
              {product.stock === 0 
                ? 'Out of Stock' 
                : isLoading 
                ? 'Adding...' 
                : 'Add to Cart'
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 