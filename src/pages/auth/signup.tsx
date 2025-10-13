import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Sign in the user after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Failed to sign in after registration');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - EMS Dental</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-primary-200 flex items-center justify-center relative overflow-hidden">
        {/* Decorative background image */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <Image src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80" alt="Dental background" fill className="object-cover" />
        </div>
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="bg-white/90 rounded-2xl shadow-2xl px-8 py-10 sm:px-10 flex flex-col items-center">
            {/* EMS Dental Enterprises Logo */}
            <div className="mb-6">
              <Image src="/logo.png" alt="EMS Dental Enterprises Logo" width={80} height={80} className="rounded-full shadow" />
            </div>
            <h2 className="text-3xl font-extrabold text-primary-800 mb-2 text-center">Create your account</h2>
            <p className="mt-2 text-center text-sm text-gray-600 mb-6">
              Or{' '}
              <Link href="/auth/signin" className="font-medium text-primary-600 hover:text-primary-500">
                sign in to your account
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
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field bg-white"
                  placeholder="Password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-700 mb-1">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field bg-white"
                  placeholder="Confirm Password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-2 text-base font-semibold shadow-md disabled:opacity-60"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 