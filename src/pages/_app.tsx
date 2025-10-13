import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import AdminLayout from '@/components/AdminLayout';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');
  const isLoginPage = router.pathname === '/admin/login';

  // Wrap admin routes with AdminLayout
  if (isAdminRoute && !isLoginPage) {
    return (
      <SessionProvider session={session}>
        <CartProvider>
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        </CartProvider>
      </SessionProvider>
    );
  }

  // Return regular pages with header
  return (
    <SessionProvider session={session}>
      <CartProvider>
        {!isAdminRoute && <Header />}
        <Component {...pageProps} />
      </CartProvider>
    </SessionProvider>
  );
} 