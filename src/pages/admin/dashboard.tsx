import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check both sessionStorage and make an API call to verify admin status
        const isAdmin = sessionStorage.getItem('isAdmin');
        const response = await fetch('/api/admin/check-auth');
        
        if (!isAdmin || !response.ok) {
          router.push('/admin/login');
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      await fetch('/api/admin/logout', { method: 'POST' });
      // Clear session storage
      sessionStorage.removeItem('isAdmin');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Placeholder data
  const stats = [
    {
      name: 'Total Revenue',
      value: '₱1,372,000',
      change: '+12.5%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      rawValue: 1372000,
    },
    {
      name: 'Total Orders',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCartIcon,
      color: 'bg-blue-500',
      rawValue: 156,
    },
    {
      name: 'Average Order Value',
      value: '₱8,795',
      change: '+4.1%',
      trend: 'up',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      rawValue: 8795,
    },
  ];

  const recentOrders = [
    { id: 1, customer: 'Skylark Magsilang', amount: '₱1,200', status: 'Completed', date: '2024-03-15' },
    { id: 2, customer: 'Fredrickson Acorda', amount: '₱850', status: 'Processing', date: '2024-03-14' },
    { id: 3, customer: 'Carl Ubaldo', amount: '₱2,100', status: 'Pending', date: '2024-03-14' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          
          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.trend === 'up' ? (
                              <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                            )}
                            <span className="ml-1">{stat.change}</span>
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts and Recent Orders */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Sales Chart Placeholder */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Sales chart will be displayed here</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/products/new" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                <p className="mt-2 text-sm text-gray-500">Create a new product listing</p>
              </Link>
              <Link href="/admin/orders" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">View All Orders</h3>
                <p className="mt-2 text-sm text-gray-500">Manage customer orders</p>
              </Link>
              <Link href="/admin/reports" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900">Generate Reports</h3>
                <p className="mt-2 text-sm text-gray-500">Create sales and inventory reports</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 