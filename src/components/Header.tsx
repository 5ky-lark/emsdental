import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import Cart from './Cart';
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/router';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { data: session } = useSession();
  const { state, clearCart } = useCart();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ 
        redirect: false 
      });
      clearCart();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      router.push('/');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="EMS Dental Enterprises Logo"
                width={50}
                height={50}
                className="mr-2"
              />
              <span className="text-lg md:text-xl font-bold text-primary-600">
                EMS Dental Enterprises
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-medium text-gray-700 hover:text-primary-600"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-primary-600"
            >
              <FiShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {session ? (
              <div className="relative">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 disabled:opacity-50"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span className="hidden md:inline">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
              >
                <FiUser className="h-5 w-5" />
                <span className="hidden md:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden rounded-md p-2 text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Cart Sidebar */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
} 