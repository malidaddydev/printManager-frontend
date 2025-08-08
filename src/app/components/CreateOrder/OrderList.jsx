"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CancelOrderPopup = ({ isOpen, onClose, orderId, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async () => {
    const token = sessionStorage.getItem('authToken');
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://printmanager-api.onrender.com/api/orders/cancel-order/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }
      toast.success('Order cancelled successfully');
      onCancel(orderId);
      onClose();
    } catch (error) {
      toast.error(`Error cancelling order: ${error.message}`);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-[90vw] sm:max-w-[500px] md:max-w-[600px] shadow-xl transform transition-all duration-300 ease-in-out animate-popup">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">Confirm Cancel</h2>
        <p className="text-xs sm:text-sm text-[#111928] mb-3 sm:mb-4">Are you sure you want to cancel this order?</p>
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="py-2 sm:py-2.5 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg text-xs sm:text-sm hover:bg-gray-300 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className={`py-2 sm:py-2.5 px-4 sm:px-6 bg-[#ef4444] text-white rounded-lg text-xs sm:text-sm flex items-center justify-center cursor-pointer ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
          >
            {loading && (
              <svg className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DropdownMenu = ({ orderId, menuPosition, menuOpen, onView, onCancel, isAllowed }) => {
  if (menuOpen !== orderId) return null;
  return createPortal(
    <div
      className="absolute bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50 min-w-[120px] sm:min-w-[150px] overflow-hidden dropdown-menu"
      style={{
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right}px`,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView(orderId);
        }}
        className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        View Order
      </button>
      {isAllowed ? "" : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancel(orderId);
          }}
          className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
        >
          Cancel Order
        </button>
      )}
    </div>,
    document.getElementById('dropdown-portal') || document.body
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
  const [cancelOrder, setCancelOrder] = useState({ isOpen: false, orderId: null });
  const [customerNames, setCustomerNames] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    orderStatus: '',
    dueDate: '',
    dueDateType: 'all'
  });

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
        const ordersArray = Array.isArray(data) ? data : [];
        setOrders(ordersArray);

        const customerIds = [...new Set(ordersArray.map(order => order.customerId))];
        const customerPromises = customerIds.map(async (id) => {
          try {
            const res = await fetch(`https://printmanager-api.onrender.com/api/customers/${id}`);
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-button')) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page on sort change
  };

  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...orders];
    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'customerId') {
          aValue = customerNames[a.customerId] || 'N/A';
          bValue = customerNames[b.customerId] || 'N/A';
        } else if (sortConfig.key === 'startDate' || sortConfig.key === 'dueDate') {
          aValue = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
          bValue = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableOrders;
  }, [orders, sortConfig, customerNames]);

  const filteredOrders = sortedOrders.filter((order) => {
    const customerName = customerNames[order.customerId]?.toLowerCase() || '';
    const matchesSearch = !searchTerm.trim() || (
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = !filters.orderStatus || order.status?.toLowerCase() === filters.orderStatus.toLowerCase();
    
    const matchesDueDate = () => {
      if (filters.dueDateType === 'all') return true;
      if (!order.dueDate) return false;

      const dueDate = new Date(order.dueDate);
      const now = new Date();
      // Set time to 00:00:00 for date-only comparison
      dueDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if (filters.dueDateType === 'overdue') {
        // Include orders where due date is not equal to current date
        // and exclude completed or cancelled orders
        return dueDate.getTime() !== now.getTime() && 
               order.status?.toLowerCase() !== 'completed' && 
               order.status?.toLowerCase() !== 'cancelled';
      } else if (filters.dueDateType === 'between') {
        if (!filters.dueDate) return false;
        const selectedDate = new Date(filters.dueDate);
        selectedDate.setHours(0, 0, 0, 0);
        return dueDate >= now && dueDate <= selectedDate;
      }
      return true;
    };

    return matchesSearch && matchesStatus && matchesDueDate();
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewOrder = (orderId) => {
    router.push(`/dashboard/order/view/${orderId}`);
    setMenuOpen(null);
  };

  const handleCancelOrder = (orderId) => {
    setCancelOrder({ isOpen: true, orderId });
    setMenuOpen(null);
  };

  const handleCancelOrderConfirmed = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      )
    );
    setMenuOpen(null);
  };

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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem('email');
    fetch('https://printmanager-api.onrender.com/api/users')
      .then((res) => res.json())
      .then((users) => {
        const user = users.find((u) => u.email === email);
        if (!user || user.isMember === true) {
          setIsAllowed(true);
        }
      });
  }, []);

  const renderSortIcon = (key) => {
    // Always show the sort icon, default to ascending if not sorted
    const isActive = sortConfig.key === key;
    const direction = isActive ? sortConfig.direction : 'asc';
    return (
      <svg
        className="w-4 h-4 inline-block ml-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {direction === 'asc' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        )}
      </svg>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border-[1px] border-[#e5e7eb] w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="font-medium text-gray-800 text-lg sm:text-xl md:text-2xl">Order Directory</h2>
            <p className="text-sm sm:text-base text-[#9ca3af] mb-3 sm:mb-4">Search and filter orders</p>
          </div>
          <div className="sm:mb-0 mb-[20px]">
            {isAllowed ? "" : (
              <button
                onClick={() => router.push('/dashboard/order/create')}
                className="bg-[#5750f1] text-white py-2 sm:py-2.5 px-4 sm:px-6 md:px-8 rounded-lg font-medium text-xs sm:text-sm hover:bg-blue-700 transition flex items-center justify-center cursor-pointer gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="orderStatus" className="block text-xs sm:text-sm font-medium text-[#111928] mb-1">
                Order Status
              </label>
              <select
                id="orderStatus"
                value={filters.orderStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, orderStatus: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="in progress">In Progress</option>
                <option value="cancelled">Cancelled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label htmlFor="dueDateType" className="block text-xs sm:text-sm font-medium text-[#111928] mb-1">
                Due Date Filter
              </label>
              <select
                id="dueDateType"
                value={filters.dueDateType}
                onChange={(e) => setFilters(prev => ({ ...prev, dueDateType: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              >
                <option value="all">All Dates</option>
                <option value="overdue">Overdue</option>
                <option value="between">Due Between Now and Selected Date</option>
              </select>
            </div>
            {filters.dueDateType === 'between' && (
              <div>
                <label htmlFor="dueDate" className="block text-xs sm:text-sm font-medium text-[#111928] mb-1">
                  Select Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={filters.dueDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
                />
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Search by order number, title, customer first name, customer last name, or status"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 sm:mt-5 md:mt-6 rounded-lg bg-white p-4 sm:p-5 md:p-6 border-[1px] border-[#e5e7eb] w-full">
        <div className="relative w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8 sm:py-10">
              <svg
                className="animate-spin h-6 sm:h-8 w-6 sm:w-8 text-[#5750f1]"
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
            <div className="text-center py-8 sm:py-10 text-[#ef4444] text-sm sm:text-lg">
              Error: {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-[#9ca3af] text-sm sm:text-lg">
              No Data Found
            </div>
          ) : (
            <>
              <table className="w-full caption-bottom text-xs sm:text-sm">
                <thead>
                  <tr className="border-none bg-[#F7F9FC] py-3 sm:py-4 text-sm sm:text-base text-[#111928]">
                    <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[100px] xl:pl-6">
                      <button onClick={() => handleSort('orderNumber')} className="flex items-center">
                        Order Number
                        {renderSortIcon('orderNumber')}
                      </button>
                    </th>
                    <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500">
                      <button onClick={() => handleSort('customerId')} className="flex items-center">
                        Customer Name
                        {renderSortIcon('customerId')}
                      </button>
                    </th>
                    <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500">
                      <button onClick={() => handleSort('title')} className="flex items-center">
                        Order Title
                        {renderSortIcon('title')}
                      </button>
                    </th>
                    <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500">
                      <button onClick={() => handleSort('startDate')} className="flex items-center">
                        Order Date
                        {renderSortIcon('startDate')}
                      </button>
                    </th>
                    <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500">
                      <button onClick={() => handleSort('dueDate')} className="flex items-center">
                        Delivery Date
                        {renderSortIcon('dueDate')}
                      </button>
                    </th>
                    <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500">
                      Order Status
                    </th>
                    <th className="h-10 sm:h-12 px-3 sm:px-4 text-right align-middle font-medium text-neutral-500 xl:pr-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#eee] transition-colors hover:bg-neutral-100/50"
                    >
                      <td className="p-3 sm:p-4 align-middle min-w-[100px] xl:pl-6">
                        <p className="text-[#111928] text-xs sm:text-sm">{order.orderNumber || 'N/A'}</p>
                      </td>
                      <td className="p-3 sm:p-4 align-middle">
                        <p className="text-[#111928] text-xs sm:text-sm">{customerNames[order.customerId] || 'N/A'}</p>
                      </td>
                      <td className="p-3 sm:p-4 align-middle">
                        <p className="text-[#111928] text-xs sm:text-sm">{order.title || 'N/A'}</p>
                      </td>
                      <td className="p-3 sm:p-4 align-middle">
                        <p className="text-[#111928] text-xs sm:text-sm">
                          {order.startDate ? new Date(order.startDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </td>
                      <td className="p-3 sm:p-4 align-middle">
                        <p className="text-[#111928] text-xs sm:text-sm">
                          {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </td>
                      <td className="p-3 sm:p-4 align-middle">
                        <span
                          className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                            order.status
                          )}`}
                        >
                          {order.status || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 align-middle xl:pr-6">
                        <div className="relative flex justify-end">
                          <button
                            className="dropdown-button hover:text-[#2563eb] transition"
                            onClick={(e) => handleMenuClick(order.id, e)}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <circle cx="10" cy="4" r="2" />
                              <circle cx="10" cy="10" r="2" />
                              <circle cx="10" cy="16" r="2" />
                            </svg>
                          </button>
                          <DropdownMenu
                            orderId={order.id}
                            menuPosition={menuPosition}
                            menuOpen={menuOpen}
                            onView={handleViewOrder}
                            onCancel={handleCancelOrder}
                            isAllowed={isAllowed}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-sm text-[#9ca3af]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#5750f1] text-white hover:bg-blue-700'
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#5750f1] text-white hover:bg-blue-700'
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === page ? 'bg-[#5750f1] text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#5750f1] text-white hover:bg-blue-700'
                    }`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#5750f1] text-white hover:bg-blue-700'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <CancelOrderPopup
        isOpen={cancelOrder.isOpen}
        onClose={() => {
          setCancelOrder({ isOpen: false, orderId: null });
        }}
        orderId={cancelOrder.orderId}
        onCancel={handleCancelOrderConfirmed}
      />
    </>
  );
}