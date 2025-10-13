import Head from 'next/head';

export default function SimpleAdminDashboard() {
  return (
    <>
      <Head>
        <title>Simple Admin Dashboard - EMS Dental</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple Admin Dashboard</h1>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Test</h2>
            <p className="text-gray-600 mb-4">
              This is a simple admin dashboard to test if routing works without authentication.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 p-4 rounded">
                <h3 className="font-semibold text-blue-800">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">1,234</p>
              </div>
              <div className="bg-green-100 p-4 rounded">
                <h3 className="font-semibold text-green-800">Total Orders</h3>
                <p className="text-2xl font-bold text-green-600">567</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded">
                <h3 className="font-semibold text-yellow-800">Revenue</h3>
                <p className="text-2xl font-bold text-yellow-600">₱89,012</p>
              </div>
            </div>
            
            <div className="mt-6">
              <a 
                href="/admin/login" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
