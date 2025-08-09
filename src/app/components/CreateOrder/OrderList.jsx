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
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
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
      {isAllowed ? null : (
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
  const [filterOption, setFilterOption] = useState('showAll');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [dueDateFilterType, setDueDateFilterType] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isAllowed, setIsAllowed] = useState(false);
  const [allOrders, setAllOrders] = useState([]);

  // Fetch user permissions
  useEffect(() => {
    const email = sessionStorage.getItem('email');
    if (email) {
      fetch('https://printmanager-api.onrender.com/api/users', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      })
        .then((res) => res.json())
        .then((users) => {
          const user = users.find((u) => u.email === email);
          if (!user || user.isMember === true) {
            setIsAllowed(true);
          }
        })
        .catch((err) => {
          console.error('Error fetching users:', err);
          setError('Failed to fetch user permissions');
        });
    }
  }, []);

  // Fetch all orders initially to get total count
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await fetch('https://printmanager-api.onrender.com/api/orders/pagination?page=1&limit=999999', {
          headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch all orders');
        }
        const fetchedOrders = await response.json();
        setAllOrders(fetchedOrders);
        setTotalOrders(fetchedOrders.length);
        setTotalPages(Math.ceil(fetchedOrders.length / limit));
      } catch (error) {
        console.error('Error fetching all orders:', error);
        setError(error.message);
      }
    };
    fetchAllOrders();
  }, [limit]);

  // Fetch orders with pagination
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://printmanager-api.onrender.com/api/orders/pagination?page=${currentPage}&limit=${limit}`,{
            headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
        const fetchedOrders = await response.json();
        setOrders(fetchedOrders);

        // Fetch customer names only if orders exist
        if (fetchedOrders.length > 0) {
          const customerIds = [...new Set(fetchedOrders.map(order => order.customerId).filter(id => id))];
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
        } else {
          setCustomerNames({});
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage, limit]);

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

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === 'asc' ? (<div className="ml-2 inline-flex flex-col space-y-[2px]" bis_skin_checked="1"><svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor"><path d="M5 0L0 5H10L5 0Z" fill=""></path></svg><svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor" className="rotate-180"><path d="M5 0L0 5H10L5 0Z" fill=""></path></svg></div>) : (<div className="ml-2 inline-flex flex-col space-y-[2px]" bis_skin_checked="1"><svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor"><path d="M5 0L0 5H10L5 0Z" fill=""></path></svg><svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor" className="rotate-180"><path d="M5 0L0 5H10L5 0Z" fill=""></path></svg></div>);
    }
    return (
      <div className="ml-2 inline-flex flex-col space-y-[2px]" bis_skin_checked="1"><svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor"><path d="M5 0L0 5H10L5 0Z" fill=""></path></svg><svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor" className="rotate-180"><path d="M5 0L0 5H10L5 0Z" fill=""></path></svg></div>
    );
  };

  // Filter and sort orders
  const filteredOrders = Array.isArray(orders)
    ? orders
        .filter((order) => {
          if (!order) return false;
          if (filterOption === 'hideCancelled' && order.status?.toLowerCase() === 'cancelled') return false;
          if (orderStatusFilter && order.status?.toLowerCase() !== orderStatusFilter.toLowerCase()) return false;

          const dueDateObj = new Date(order.dueDate);
          if (isNaN(dueDateObj.getTime())) return false;

          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const selectedDate = dueDateFilter ? new Date(dueDateFilter) : null;
          if (selectedDate) selectedDate.setHours(23, 59, 59, 999);

          if (dueDateFilterType === 'overdue') {
            if (dueDateObj >= now) return false;
          } else if (dueDateFilterType === 'dueBy' && dueDateFilter) {
            if (dueDateObj < now || dueDateObj > selectedDate) return false;
          }

          if (!searchTerm.trim()) return true;
          const customerName = customerNames[order.customerId]?.toLowerCase() || '';
          return (
            (order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (order.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (customerName.includes(searchTerm.toLowerCase()) || false) ||
            (order.status?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
          );
        })
        .sort((a, b) => {
          if (!sortField) return 0;
          let valueA = a[sortField] || '';
          let valueB = b[sortField] || '';
          if (sortField === 'startDate' || sortField === 'dueDate') {
            valueA = new Date(valueA).getTime();
            valueB = new Date(valueB).getTime();
          } else if (sortField === 'customerId') {
            valueA = customerNames[valueA]?.toLowerCase() || '';
            valueB = customerNames[valueB]?.toLowerCase() || '';
          } else {
            valueA = valueA.toString().toLowerCase();
            valueB = valueB.toString().toLowerCase();
          }
          if (sortOrder === 'asc') {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        })
    : [];

  // Action handlers
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
    setAllOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      )
    );
    setMenuOpen(null);
  };

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

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render pagination
  const renderPagination = () => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <span className="text-sm text-[#111928]">Show</span>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="px-2 py-1 border border-[#e5e7eb] rounded-lg text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={999999}>All</option>
          </select>
          <span className="text-sm text-[#111928]">entries</span>
          <span className="text-sm text-[#111928]">
            Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalOrders)} of {totalOrders} entries
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#5750f1] text-white hover:bg-blue-700'
            }`}
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#5750f1] text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-[#111928]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#5750f1] text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#5750f1] text-white hover:bg-blue-700'
            }`}
          >
            Last
          </button>
        </div>
      </div>
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
            {isAllowed ? null : (
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="filterOption" className="block text-xs sm:text-sm font-medium text-[#111928] mb-1">
                Filter Orders
              </label>
              <select
                id="filterOption"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              >
                <option value="showAll">Show All Orders</option>
                <option value="hideCancelled">Hide Cancelled Orders</option>
              </select>
            </div>
            <div>
              <label htmlFor="orderStatusFilter" className="block text-xs sm:text-sm font-medium text-[#111928] mb-1">
                Order Status
              </label>
              <select
                id="orderStatusFilter"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="In Progress">In Progress</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label htmlFor="dueDateFilterType" className="block text-xs sm:text-sm font-medium text-[#111928] mb-1">
                Due Date Filter
              </label>
              <select
                id="dueDateFilterType"
                value={dueDateFilterType}
                onChange={(e) => setDueDateFilterType(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm mb-2"
              >
                <option value="">No Filter</option>
                <option value="overdue">Overdue</option>
                <option value="dueBy">Due Between Now and Date</option>
              </select>
              {dueDateFilterType === 'dueBy' && (
                <div className="flex flex-col gap-2">
                  <input
                    type="date"
                    id="dueDateFilter"
                    value={dueDateFilter}
                    onChange={(e) => setDueDateFilter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
                  />
                  {dueDateFilter && (
                    <span className="text-xs sm:text-sm text-[#111928]">
                      Showing orders due between {new Date().toLocaleDateString()} and {new Date(dueDateFilter).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
              {dueDateFilterType === 'overdue' && (
                <span className="text-xs sm:text-sm text-[#111928]">
                  Showing orders overdue as of {new Date().toLocaleDateString()}
                </span>
              )}
            </div>
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
            <table className="w-full caption-bottom text-xs sm:text-sm">
              <thead>
                <tr className="border-none bg-[#F7F9FC] py-3 sm:py-4 text-sm sm:text-base text-[#111928]">
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[100px] xl:pl-6 cursor-pointer"
                    onClick={() => handleSort('orderNumber')}
                  >
                    <div className="flex items-center">
                      Order Number {renderSortIcon('orderNumber')}
                    </div>
                  </th>
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 cursor-pointer"
                    onClick={() => handleSort('customerId')}
                  >
                    <div className="flex items-center">
                      Customer Name {renderSortIcon('customerId')}
                    </div>
                  </th>
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Order Title {renderSortIcon('title')}
                    </div>
                  </th>
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 cursor-pointer"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center">
                      Order Date {renderSortIcon('startDate')}
                    </div>
                  </th>
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 cursor-pointer"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center">
                      Delivery Date {renderSortIcon('dueDate')}
                    </div>
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
                {filteredOrders.map((order) => (
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
          )}
        </div>
        {renderPagination()}
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