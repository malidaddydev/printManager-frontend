"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function OverdueAlerts() {
  const router = useRouter();
  const [overdueOrders, setOverdueOrders] = useState([]);
  const [customerNames, setCustomerNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(3);

  // Fetch overdue orders and customer names
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://printmanager-api.onrender.com/api/orders', {
                headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
        const data = await response.json();
        const ordersArray = Array.isArray(data) ? data : [];
        
        // Filter overdue orders (dueDate before current date)
        const currentDate = new Date();
        const overdue = ordersArray
          .filter(order => order.dueDate && new Date(order.dueDate) < currentDate)
          .map(order => ({
            ...order,
            daysOverdue: Math.ceil(
              (currentDate - new Date(order.dueDate)) / (1000 * 60 * 60 * 24)
            )
          }))
          // Sort by dueDate (most recent first)
          .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

        setOverdueOrders(overdue);

        // Fetch customer names
        const customerIds = [...new Set(overdue.map(order => order.customerId))];
        const customerPromises = customerIds.map(async (id) => {
          try {
            const res = await fetch(`https://printmanager-api.onrender.com/api/customers/${id}`, {
                    headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
            });
            if (!res.ok) throw new Error(`Failed to fetch customer ${id}`);
            const customerData = await res.json();
            return { 
              id, 
              firstName: customerData.firstName || '', 
              lastName: customerData.lastName || '' 
            };
          } catch (err) {
            console.error(err);
            return { id, firstName: '', lastName: '' };
          }
        });
        const customers = await Promise.all(customerPromises);
        const customerMap = customers.reduce((acc, { id, firstName, lastName }) => {
          acc[id] = `${firstName} ${lastName}`.trim() || 'N/A';
          return acc;
        }, {});
        setCustomerNames(customerMap);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message);
        toast.error(error.message || 'Error fetching overdue orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle Show More/View Less
  const handleToggleDisplay = () => {
    if (displayCount >= overdueOrders.length) {
      setDisplayCount(3); // Reset to 3 orders
    } else {
      setDisplayCount(prev => Math.min(prev + 3, overdueOrders.length)); // Show 3 more
    }
  };

  // Handle View Order
  const handleViewOrder = (orderId) => {
    router.push(`/dashboard/order/view/${orderId}`);
  };

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 border-[1px] border-[#e5e7eb]">
      <h2 className="font-medium text-gray-800 text-[24px]">Overdue Alerts</h2>
      <p className="text-[18px] text-[#9ca3af] mb-4">Orders that need immediate attention</p>
      <div className="relative w-full overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <svg
              className="animate-spin h-8 w-8 text-[#5750f1]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-[#ef4444] text-lg">
            Error: {error}
          </div>
        ) : overdueOrders.length === 0 ? (
          <div className="text-center py-10 text-[#9ca3af] text-lg">
            No Overdue Orders Found
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-none bg-red-50 py-4 text-base text-[#7f1d1d]">
                <th className="h-12 px-4 text-left align-middle font-medium text-red-600 min-w-[100px] xl:pl-7.5">Order Number</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-red-600">Customer Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-red-600">Days Overdue</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-red-600 xl:pr-7.5">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {overdueOrders.slice(0, displayCount).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-red-200 transition-colors hover:bg-red-100/50"
                >
                  <td className="p-4 align-middle min-w-[100px] xl:pl-7.5">
                    <p className="font-medium text-red-900">{order.orderNumber || 'N/A'}</p>
                  </td>
                  <td className="p-4 align-middle">
                    <p className="text-sm text-red-700">{customerNames[order.customerId] || 'N/A'}</p>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="max-w-fit rounded-full px-3.5 py-1 text-xs font-medium text-red-800 border border-red-600 bg-red-50">
                      {order.daysOverdue} days overdue
                    </div>
                  </td>
                  <td className="p-4 align-middle xl:pr-7.5">
                    <div className="relative flex justify-end">
                      <button
                        className="hover:text-[#2563eb]"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <span className="sr-only">View Order</span>
                        <svg
                          width={20}
                          height={20}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 6.875a3.125 3.125 0 100 6.25 3.125 3.125 0 000-6.25zM8.123 10a1.875 1.875 0 113.75 0 1.875 1.875 0 01-3.75 0z" />
                          <path d="M10 2.708c-3.762 0-6.296 2.254-7.767 4.164l-.026.035c-.333.432-.64.83-.847 1.3C1.137 8.71 1.04 9.26 1.04 10s.096 1.29.319 1.793c.208.47.514.868.847 1.3l.026.034c1.47 1.911 4.005 4.165 7.766 4.165 3.762 0 6.296-2.254 7.766-4.165l.027-.034c.333-.432.639-.83.847-1.3.222-.504.319-1.053.319-1.793s-.097-1.29-.32-1.793c-.207-.47-.513-.868-.846-1.3l-.027-.035c-1.47-1.91-4.004-4.164-7.766-4.164zM3.223 7.635C4.582 5.87 6.79 3.958 9.999 3.958s5.418 1.913 6.776 3.677c.366.475.58.758.72 1.077.132.298.213.662.213 1.288s-.081.99-.213 1.288c-.14.319-.355.602-.72 1.077-1.358 1.764-3.568 3.677-6.776 3.677-3.208 0-5.417-1.913-6.775-3.677-.366-.475-.58-.758-.72-1.077-.132-.298-.213-.662-.213-1.288s.08-.99.212-1.288c.141-.319.355-.602.72-1.077z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {overdueOrders.length > 3 && (
        <div className="mt-4">
          <button
            className="w-full bg-red-600 text-white text-sm font-medium py-[13px] px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={handleToggleDisplay}
          >
            {displayCount >= overdueOrders.length ? 'View Less' : 'Show More'}
          </button>
        </div>
      )}
    </div>
  );
}

export default OverdueAlerts;