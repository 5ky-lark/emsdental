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

  // Debug: log the image array
  console.log('Product images:', product.name, product.images);

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
        image: product.images?.[0] || '/images/placeholder.jpg',
      };
      addItem(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Improved image path logic: support both images array and image string
  let imageUrl = '/images/placeholder.jpg';
  if (Array.isArray(product.images) && product.images[0]) {
    if (product.images[0].startsWith('/') || product.images[0].startsWith('http')) {
      imageUrl = product.images[0];
    } else {
      imageUrl = '/images/' + product.images[0];
    }
  } else if ((product as any).image) {
    const singleImage = (product as any).image;
    if (singleImage.startsWith('/') || singleImage.startsWith('http')) {
      imageUrl = singleImage;
    } else {
      imageUrl = '/images/' + singleImage;
    }
  }
  if (imageError) {
    imageUrl = '/images/placeholder.jpg';
  }

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
              className="group-hover:opacity-75"
              priority={true}
              onError={() => setImageError(true)}
            />
          </div>
        </Link>
        <div className="p-4">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
          </Link>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-medium text-gray-900">₱{product.price.toLocaleString()}</p>
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 