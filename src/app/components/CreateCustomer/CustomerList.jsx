'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewAddressPopup = ({ isOpen, onClose, address }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-[90vw] sm:max-w-[500px] shadow-xl transform transition-all duration-300 ease-in-out animate-popup">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">Customer Address</h2>
        <p className="text-xs sm:text-sm text-[#111928] mb-3 sm:mb-4">{address || 'No address provided'}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="py-2 sm:py-2.5 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg text-xs sm:text-sm hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const EditCustomerPopup = ({ isOpen, onClose, customer, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    mobile: customer?.mobile || '',
    mobile2: customer?.mobile2 || '',
    company: customer?.company || '',
    address: customer?.address || '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        mobile: customer.mobile || '',
        mobile2: customer.mobile2 || '',
        company: customer.company || '',
        address: customer.address || '',
      });
      setError(null);
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://printmanager-api.onrender.com/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update customer');
      }
      const savedCustomer = await response.json();
      toast.success('Customer updated successfully');
      onSave({ id: customer.id, ...savedCustomer });
      onClose();
    } catch (error) {
      toast.error(`Error editing customer: ${error.message}`);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-[90vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto shadow-xl transform transition-all duration-300 ease-in-out animate-popup">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">Edit Customer</h2>
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Mobile *</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Mobile 2</label>
            <input
              type="tel"
              name="mobile2"
              value={formData.mobile2}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              rows="4"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 sm:py-2.5 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg text-xs sm:text-sm hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`py-2 sm:py-2.5 px-4 sm:px-6 bg-[#5750f1] text-white rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center transition ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading && (
                <svg className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteCustomerPopup = ({ isOpen, onClose, customerId, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://printmanager-api.onrender.com/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete customer');
      }
      toast.success('Customer deleted successfully');
      onDelete(customerId);
      onClose();
    } catch (error) {
      toast.error(`Error deleting customer: ${error.message}`);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-[90vw] sm:max-w-[500px] shadow-xl transform transition-all duration-300 ease-in-out animate-popup">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">Confirm Delete</h2>
        <p className="text-xs sm:text-sm text-[#111928] mb-3 sm:mb-4">Are you sure you want to delete this customer?</p>
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="py-2 sm:py-2.5 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg text-xs sm:text-sm hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`py-2 sm:py-2.5 px-4 sm:px-6 bg-[#ef4444] text-white rounded-lg text-xs sm:text-sm flex items-center justify-center transition ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
          >
            {loading && (
              <svg className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Deleting...' : 'Delete Customer'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DropdownMenu = ({ customerId, menuPosition, menuOpen, onEdit, onDelete }) => {
  if (menuOpen !== customerId) return null;
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
          onEdit(customerId);
        }}
        className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        Edit Customer
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(customerId);
        }}
        className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        Delete Customer
      </button>
    </div>,
    document.getElementById('dropdown-portal') || document.body
  );
};

export default function CustomerList({ onCustomerUpdated }) {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewAddress, setViewAddress] = useState({ isOpen: false, address: '' });
  const [editCustomer, setEditCustomer] = useState({ isOpen: false, customer: null });
  const [deleteCustomer, setDeleteCustomer] = useState({ isOpen: false, customerId: null });
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://printmanager-api.onrender.com/api/customers', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [onCustomerUpdated]);

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

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm.trim()) return true;
    const matchesSearch =
      (customer.id && customer.id.toString().includes(searchTerm)) ||
      (customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesSearch;
  });

  // Action handlers
  const handleEditCustomer = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setEditCustomer({ isOpen: true, customer });
      setMenuOpen(null);
    } else {
      console.error('Customer not found for customerId:', customerId);
    }
  };

  const handleDeleteCustomer = (customerId) => {
    setDeleteCustomer({ isOpen: true, customerId });
    setMenuOpen(null);
  };

  const handleSaveCustomer = (updatedCustomer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? { ...c, ...updatedCustomer } : c))
    );
    if (typeof onCustomerUpdated === 'function') {
      onCustomerUpdated();
    }
    setMenuOpen(null);
  };

  const handleDeleteCustomerConfirmed = (customerId) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    if (typeof onCustomerUpdated === 'function') {
      onCustomerUpdated();
    }
    setMenuOpen(null);
  };

  // Handle menu open and position
  const handleMenuClick = (customerId, event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const newPosition = {
      top: rect.bottom + window.scrollY,
      right: Math.max(16, window.innerWidth - rect.right + window.scrollX), // Ensure minimum 16px from right edge
    };
    setMenuPosition(newPosition);
    setMenuOpen(menuOpen === customerId ? null : customerId);
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
          })
      }, []);
    
  

  return (
    <div>
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-[#e5e7eb] mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-800">Customer Directory</h2>
            <p className="text-sm sm:text-base text-[#9ca3af] mt-1">Search customer accounts</p>
          </div>
          <div>
            {isAllowed ? (
              ""
            ) : (
            <button
              onClick={() => router.push('/dashboard/customer/create')}
              className="bg-[#5750f1] text-white py-2 sm:py-2.5 px-4 sm:px-6 md:px-8 rounded-lg font-medium text-xs sm:text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1"
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
              Create Customer
            </button>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search by id, first name, last name, email, or company"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 sm:mt-5 md:mt-6 rounded-lg bg-white p-4 sm:p-5 md:p-6 border border-[#e5e7eb]">
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
            <div className="text-center py-8 sm:py-10 text-[#ef4444] text-sm sm:text-base">
              Error: {error}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-[#9ca3af] text-sm sm:text-base">
              No Data Found
            </div>
          ) : (
            <table className="w-full caption-bottom text-xs sm:text-sm">
              <thead>
                <tr className="border-none bg-[#F7F9FC] py-3 sm:py-4 text-sm sm:text-base text-[#111928]">
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[80px] sm:min-w-[100px] xl:pl-6">Customer ID</th>
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500">First Name</th>
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500">Last Name</th>
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 hidden sm:table-cell">Email</th>
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 hidden md:table-cell">Mobile</th>
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 hidden lg:table-cell">Mobile 2</th>
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 hidden lg:table-cell">Company</th>
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500">Address</th>
                  {isAllowed ? "" : (
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-right align-middle font-medium text-neutral-500 xl:pr-6">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-[#eee] transition-colors hover:bg-neutral-100/50"
                  >
                    <td className="p-3 sm:p-4 align-middle min-w-[80px] sm:min-w-[100px] xl:pl-6">
                      <p className="text-[#111928] text-xs sm:text-sm">{customer.id || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle">
                      <p className="text-[#111928] text-xs sm:text-sm">{customer.firstName || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle">
                      <p className="text-[#111928] text-xs sm:text-sm">{customer.lastName || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle hidden sm:table-cell">
                      <p className="text-[#111928] text-xs sm:text-sm">{customer.email || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle hidden md:table-cell">
                      <p className="text-[#111928] text-xs sm:text-sm">{customer.mobile || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle hidden lg:table-cell">
                      <p className="text-[#111928] text-xs sm:text-sm">{customer.mobile2 || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle hidden lg:table-cell">
                      <p className="text-[#111928] text-xs sm:text-sm">{customer.company || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle">
                      <button
                        onClick={() => {
                          setViewAddress({ isOpen: true, address: customer.address });
                        }}
                        className="text-[#5750f1] hover:text-blue-700 text-xs sm:text-sm"
                      >
                        View Address
                      </button>
                    </td>
                    {isAllowed ? (
                      ""
                    ) : (
                    <td className="p-3 sm:p-4 align-middle xl:pr-6">
                      <div className="relative flex justify-end">
                        <button
                          className="dropdown-button hover:text-[#2563eb] transition"
                          onClick={(e) => handleMenuClick(customer.id, e)}
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
                          customerId={customer.id}
                          menuPosition={menuPosition}
                          menuOpen={menuOpen}
                          onEdit={handleEditCustomer}
                          onDelete={handleDeleteCustomer}
                        />
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ViewAddressPopup
        isOpen={viewAddress.isOpen}
        onClose={() => {
          setViewAddress({ isOpen: false, address: '' });
        }}
        address={viewAddress.address}
      />
      <EditCustomerPopup
        isOpen={editCustomer.isOpen}
        onClose={() => {
          setEditCustomer({ isOpen: false, customer: null });
        }}
        customer={editCustomer.customer}
        onSave={handleSaveCustomer}
      />
      <DeleteCustomerPopup
        isOpen={deleteCustomer.isOpen}
        onClose={() => {
          setDeleteCustomer({ isOpen: false, customerId: null });
        }}
        customerId={deleteCustomer.customerId}
        onDelete={handleDeleteCustomerConfirmed}
      />
    </div>
  );
}