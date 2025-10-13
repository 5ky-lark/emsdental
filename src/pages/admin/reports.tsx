import { useState } from 'react';
import { useRouter } from 'next/router';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export default function Reports() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  // Dashboard data
  const stats = [
    {
      name: 'Total Revenue',
      value: '₱1,372,000',
      change: '+12.5%',
      trend: 'up',
      rawValue: 1372000,
    },
    {
      name: 'Total Orders',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      rawValue: 156,
    },
    {
      name: 'Average Order Value',
      value: '₱8,795',
      change: '+4.1%',
      trend: 'up',
      rawValue: 8795,
    },
  ];

  const recentOrders = [
    { id: 1, customer: 'John Doe', amount: '₱67,200', status: 'Completed', date: '2024-03-15', rawAmount: 67200 },
    { id: 2, customer: 'Jane Smith', amount: '₱47,600', status: 'Processing', date: '2024-03-14', rawAmount: 47600 },
    { id: 3, customer: 'Mike Johnson', amount: '₱117,600', status: 'Completed', date: '2024-03-14', rawAmount: 117600 },
    { id: 4, customer: 'Sarah Wilson', amount: '₱25,200', status: 'Pending', date: '2024-03-13', rawAmount: 25200 },
  ];

  const reports = [
    { id: 'sales', name: 'Sales Report', description: 'Detailed sales analysis and revenue metrics' },
    { id: 'inventory', name: 'Inventory Report', description: 'Current stock levels and product movement' },
    { id: 'orders', name: 'Orders Report', description: 'Order history and customer purchase patterns' },
  ];

  const handleDownload = () => {
    if (!selectedReport) return;

    let csvContent = '';
    let filename = '';

    switch (selectedReport) {
      case 'sales':
        // Sales report with revenue metrics
        const salesHeaders = ['Metric', 'Value', 'Change', 'Trend'];
        const salesData = stats.map(stat => [
          stat.name,
          stat.value,
          stat.change,
          stat.trend
        ]);
        csvContent = [
          salesHeaders.join(','),
          ...salesData.map(row => row.join(','))
        ].join('\n');
        filename = 'sales-report';
        break;

      case 'orders':
        // Orders report with detailed order information
        const orderHeaders = ['Order ID', 'Customer', 'Amount', 'Status', 'Date'];
        const orderData = recentOrders.map(order => [
          order.id,
          order.customer,
          order.amount,
          order.status,
          order.date
        ]);
        csvContent = [
          orderHeaders.join(','),
          ...orderData.map(row => row.join(','))
        ].join('\n');
        filename = 'orders-report';
        break;

      case 'inventory':
        // Placeholder inventory data
        const inventoryHeaders = ['Product ID', 'Product Name', 'Stock Level', 'Status'];
        const inventoryData = [
          ['P001', 'Product A', '50', 'In Stock'],
          ['P002', 'Product B', '25', 'Low Stock'],
          ['P003', 'Product C', '100', 'In Stock'],
        ];
        csvContent = [
          inventoryHeaders.join(','),
          ...inventoryData.map(row => row.join(','))
        ].join('\n');
        filename = 'inventory-report';
        break;
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <p className="mt-2 text-sm text-gray-700">
              Generate and download various reports for your store.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Report Selection */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Report</h2>
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedReport === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <h3 className="text-sm font-medium text-gray-900">{report.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Date Range</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-8 flex justify-end">
          <button
           
            disabled={!selectedReport}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              selectedReport
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
} 