"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DropdownMenu = ({ orderId, menuPosition, menuOpen }) => {
  if (menuOpen !== orderId) return null;
  return (
    <div
      className="absolute top-0 bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50 min-w-[150px] overflow-hidden dropdown-menu"
      style={{
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right}px`,
      }}
    >
      <button
        className="block w-full text-left px-4 py-2 text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
        disabled
      >
        Edit Order
      </button>
      <button
        className="block w-full text-left px-4 py-2 text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
        disabled
      >
        Delete Order
      </button>
    </div>
  );
};

export default function OrderList() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [customerNames, setCustomerNames] = useState({});

  // Fetch orders and customer names
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://printmanager-api.onrender.com/api/orders');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
        const data = await response.json();
        console.log(data)
        const ordersArray = Array.isArray(data) ? data : [];
        setOrders(ordersArray);

        // Fetch customer names for each order
        const customerIds = [...new Set(ordersArray.map(order => order.customerId))];
        const customerPromises = customerIds.map(async (id) => {
          try {
            const res = await fetch(`https://printmanager-api.onrender.com/api/customers/${id}`);
            if (!res.ok) throw new Error(`Failed to fetch customer ${id}`);
            const customerData = await res.json();
            return { id, name: customerData.name || 'N/A' };
          } catch (err) {
            console.error(err);
            return { id, name: 'N/A' };
          }
        });
        const customers = await Promise.all(customerPromises);
        const customerMap = customers.reduce((acc, { id, name }) => {
          acc[id] = name;
          return acc;
        }, {});
        setCustomerNames(customerMap);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-button')) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter orders
  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        if (!searchTerm.trim()) return true;
        return (
          (order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (order.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (customerNames[order.customerId]?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (order.status?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
        );
      })
    : [];

  // Handle menu open and position
  const handleMenuClick = (orderId, event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const newPosition = {
      top: rect.bottom + window.scrollY,
      right: window.innerWidth - rect.right + window.scrollX,
    };
    setMenuPosition(newPosition);
    setMenuOpen(menuOpen === orderId ? null : orderId);
  };

  // Status color mapping
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="bg-white p-8 rounded-lg w-full border-[1px] border-[#e5e7eb]">
        <div className="flex justify-between">
          <div>
            <h2 className="font-medium text-gray-800 text-[24px] mb-2">Order Directory</h2>
            <p className="text-[18px] text-[#9ca3af] mb-6">Search and filter orders</p>
          </div>
          <div>
            <button
              onClick={() => router.push('/dashboard/order/create')}
              className="bg-[#5750f1] text-white py-[13px] px-[35px] rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center cursor-pointer gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Order
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by order number, title, customer name, or status"
            className="w-full sm:w-1/3 px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white p-8 rounded-lg w-full border-[1px] border-[#e5e7eb]">
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
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-[#9ca3af] text-lg">
              No Data Found
            </div>
          ) : (
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-none bg-[#F7F9FC] py-4 text-base text-[#111928]">
                  <th className="h-12 px-4 text-left align-middle font-medium text-neutral-500 min-w-[100px] xl:pl-7.5">
                    Order Number
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-neutral-500">
                    Customer Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-neutral-500">
                    Order Title
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-neutral-500">
                    Order Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-neutral-500">
                    Delivery Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-neutral-500">
                    Order Status
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-neutral-500 xl:pr-7.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#eee] transition-colors hover:bg-neutral-100/50"
                  >
                    <td className="p-4 align-middle min-w-[100px] xl:pl-7.5">
                      <p className="text-[#111928]">{order.orderNumber || 'N/A'}</p>
                    </td>
                    <td className="p-4 align-middle">
                      <p className="text-[#111928]">{customerNames[order.customerId] || 'N/A'}</p>
                    </td>
                    <td className="p-4 align-middle">
                      <p className="text-[#111928]">{order.title || 'N/A'}</p>
                    </td>
                    <td className="p-4 align-middle">
                      <p className="text-[#111928]">
                        {order.startDate ? new Date(order.startDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="p-4 align-middle">
                      <p className="text-[#111928]">
                        {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                          order.status
                        )}`}
                      >
                        {order.status || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 align-middle xl:pr-7.5">
                      <div className="relative flex justify-end">
                        <button
                          className="dropdown-button hover:text-[#2563eb] transition"
                          onClick={(e) => handleMenuClick(order.id, e)}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <circle cx="10" cy="4" r="2" />
                            <circle cx="10" cy="10" r="2" />
                            <circle cx="10" cy="16" r="2" />
                          </svg>
                        </button>
                        {/* <DropdownMenu
                          orderId={order.id}
                          menuPosition={menuPosition}
                          menuOpen={menuOpen}
                        /> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}