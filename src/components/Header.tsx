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
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="EMS Dental Enterprises Logo"
                  width={50}
                  height={50}
                  className="mr-3 rounded-full bg-white p-1 shadow-md group-hover:shadow-lg transition-shadow duration-300"
                />
              </div>
              <span className="text-lg md:text-xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">
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
                className="text-base font-medium text-white hover:text-blue-100 px-3 py-2 rounded-md hover:bg-blue-500/20 transition-all duration-300"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-white hover:text-blue-100 hover:bg-blue-500/20 rounded-md transition-all duration-300"
            >
              <FiShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold shadow-lg">
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
                  className="flex items-center space-x-2 text-white hover:text-blue-100 hover:bg-blue-500/20 px-3 py-2 rounded-md transition-all duration-300 disabled:opacity-50"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span className="hidden md:inline">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center space-x-2 text-white hover:text-blue-100 hover:bg-blue-500/20 px-3 py-2 rounded-md transition-all duration-300"
              >
                <FiUser className="h-5 w-5" />
                <span className="hidden md:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden rounded-md p-2 text-white hover:text-blue-100 hover:bg-blue-500/20 transition-all duration-300"
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
          <div className="md:hidden bg-blue-500/10 backdrop-blur-sm border-t border-blue-400/20">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-blue-500/20 hover:text-blue-100 rounded-md mx-2 transition-all duration-300"
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