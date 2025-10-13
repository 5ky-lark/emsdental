import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const adminToken = document.cookie.includes('adminToken');
    if (adminToken) {
      // User is already logged in, redirect to dashboard
      window.location.href = '/admin/dashboard';
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting admin login with:', { username, hasPassword: !!password });
      
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Set sessionStorage for client-side checks
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('adminUser', JSON.stringify(data.user));
      
      console.log('Login successful, redirecting to dashboard');
      
      // Use window.location for a hard redirect to avoid Next.js navigation issues
      window.location.href = '/admin/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login - Dental Chairs</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-white to-primary-200 relative overflow-hidden">
        {/* Decorative background image */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <Image src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" alt="Dental background" fill className="object-cover" />
        </div>
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="bg-white/90 rounded-2xl shadow-2xl px-8 py-10 sm:px-10 flex flex-col items-center">
            {/* Logo placeholder */}
            <div className="mb-6">
              <Image src="/logo.png" alt="Logo" width={56} height={56} className="rounded-full shadow" />
            </div>
            <h2 className="text-3xl font-extrabold text-primary-800 mb-2 text-center">Admin Login</h2>
            <p className="text-gray-500 mb-6 text-center">Access the EMS Dental admin dashboard</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded w-full mb-4 text-center animate-pulse">
                {error}
              </div>
            )}

            <form className="w-full space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-primary-700 mb-1">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field bg-white"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field bg-white"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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