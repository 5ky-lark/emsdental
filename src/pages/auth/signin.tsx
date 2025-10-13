import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push('/');
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - Dental Chairs</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-white to-primary-200 relative overflow-hidden">
        {/* Decorative background image */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <Image src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80" alt="Dental background" fill className="object-cover" />
        </div>
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="bg-white/90 rounded-2xl shadow-2xl px-8 py-10 sm:px-10 flex flex-col items-center">
            {/* Logo placeholder */}
            <div className="mb-6">
              <Image src="/logo.png" alt="Logo" width={56} height={56} className="rounded-full shadow" />
            </div>
            <h2 className="text-3xl font-extrabold text-primary-800 mb-2 text-center">Sign in to your account</h2>
            <p className="mt-2 text-center text-sm text-gray-600 mb-6">
              Or{' '}
              <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
                create a new account
              </Link>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded w-full mb-4 text-center animate-pulse">
                {error}
              </div>
            )}

            <form className="w-full space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-1">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field bg-white"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field bg-white"
                  placeholder="Password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-2 text-base font-semibold shadow-md disabled:opacity-60"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 