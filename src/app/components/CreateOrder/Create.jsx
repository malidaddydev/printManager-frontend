import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';

const CustomerSearchDropdown = ({ customers, menuOpen, menuPosition, onSelectCustomer }) => {
  if (!menuOpen || !customers || customers.length === 0) return null;

  return createPortal(
    <div
      className="absolute bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50 max-h-[200px] overflow-y-auto dropdown-menu"
      style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
    >
      {customers.map((customer) => (
        <button
          key={customer.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelectCustomer(customer);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
        >
          <span className="font-medium">{customer.name || 'N/A'}</span> - {customer.email || 'N/A'}
        </button>
      ))}
    </div>,
    document.getElementById('dropdown-portal') || document.body
  );
};

const OrderItem = ({ itemId, onRemove }) => {
  return (
    <div className="bg-white p-8 rounded-lg w-full border-[1px] border-[#e5e7eb] mb-7">
      <div className="flex justify-between items-center mb-3 ">
        <h4 className="text-lg font-semibold text-[#111928]">Order Item #{itemId}</h4>
        <button
          onClick={() => {
            onRemove(itemId);
          }}
          className="py-2 px-4 bg-[#ef4444] text-white rounded-lg hover:bg-red-700"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#111928]">Product Title</label>
          <input
            type="text"
            name={`product-title-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">Price (cents)</label>
          <input
            type="number"
            name={`product-price-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">Color</label>
          <input
            type="text"
            name={`product-color-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">Category</label>
          <select
            name={`product-category-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            required
          >
            <option value="Goods with Service">Goods with Service</option>
            <option value="Service Only">Service Only</option>
            <option value="Goods Only">Goods Only</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">Service</label>
          <select
            name={`product-service-id-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            required
          >
            <option value="1">Sublimation</option>
            <option value="2">Embroidery</option>
            <option value="3">DTF</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">SKU</label>
          <input
            type="text"
            name={`product-sku-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">Turnaround Days</label>
          <input
            type="number"
            name={`product-turnaround-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">Quantity</label>
          <input
            type="number"
            name={`item-quantity-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">Size Breakdown</label>
          <input
            type="text"
            name={`item-size-breakdown-${itemId}`}
            placeholder="e.g., S:3,M:5,L:2"
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">Item Notes</label>
          <textarea
            name={`item-notes-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111928]">Requires Customer Garment</label>
          <select
            name={`product-customer-garment-${itemId}`}
            className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            required
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      </div>
      <div className="mt-7">
        <h4 className="text-lg font-semibold text-[#111928] mb-2">Production Stages</h4>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111928]">Stage Name</label>
              <input
                type="text"
                name={`stage-name-${itemId}`}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">State</label>
              <input
                type="text"
                name={`stage-state-${itemId}`}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">Due Days</label>
              <input
                type="number"
                name={`stage-due-days-${itemId}`}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreateOrder() {
 const router = useRouter();
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    mobile: '',
    mobile2: '',
    company: '',
    address: '',
  });
  const [isCustomerSelected, setIsCustomerSelected] = useState(false);
  const [orderData, setOrderData] = useState({
    orderTitle: '',
    dueDate: '',
    status: 'Draft',
    notes: '',
  });
  const [orderItems, setOrderItems] = useState([1]);
  const [itemCounter, setItemCounter] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSearchCustomer = async () => {
    if (!customerId) {
      toast.error('Please enter a customer ID');
      setCustomers([]);
      setMenuOpen(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://printmanager-api.onrender.com/api/customers/${customerId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Customer not found');
      }
      const customer = await response.json();
      setCustomers([customer]);
      setMenuOpen(true);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch customer');
      setCustomers([]);
      setMenuOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setCustomerData({
      name: customer.name || '',
      email: customer.email || '',
      mobile: customer.mobile || '',
      mobile2: customer.mobile2 || '',
      company: customer.company || '',
      address: customer.address || '',
    });
    setIsCustomerSelected(true);
    setMenuOpen(false);
    setCustomerId('');
    setCustomers([]);
  };

  const handleClearCustomer = () => {
    setCustomerData({
      name: '',
      email: '',
      mobile: '',
      mobile2: '',
      company: '',
      address: '',
    });
    setIsCustomerSelected(false);
    setCustomerId('');
    setCustomers([]);
    setMenuOpen(false);
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({ ...prev, [name]: value }));
  };

  const addOrderItem = () => {
    setItemCounter((prev) => prev + 1);
    setOrderItems((prev) => [...prev, itemCounter + 1]);
  };

  const removeOrderItem = (itemId) => {
    setOrderItems((prev) => prev.filter((id) => id !== itemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      toast.error('Please add at least one order item');
      return;
    }
    setLoading(true);

    const formData = {
      customer: customerData,
      order: {
        order_title: orderData.orderTitle,
        due_date: orderData.dueDate,
        status: orderData.status,
        notes: orderData.notes,
        order_items: orderItems.map((itemId) => ({
          product: {
            title: document.querySelector(`[name="product-title-${itemId}"]`).value,
            price: parseInt(document.querySelector(`[name="product-price-${itemId}"]`).value),
            color: document.querySelector(`[name="product-color-${itemId}"]`).value,
            category: document.querySelector(`[name="product-category-${itemId}"]`).value,
            service_id: parseInt(document.querySelector(`[name="product-service-id-${itemId}"]`).value),
            sku: document.querySelector(`[name="product-sku-${itemId}"]`).value,
            turnaround_days: parseInt(document.querySelector(`[name="product-turnaround-${itemId}"]`).value),
            requires_customer_garment: document.querySelector(`[name="product-customer-garment-${itemId}"]`).value === 'true',
            stages: [
              {
                state: document.querySelector(`[name="stage-state-${itemId}"]`).value,
                name: document.querySelector(`[name="stage-name-${itemId}"]`).value,
                dueDays: parseInt(document.querySelector(`[name="stage-due-days-${itemId}"]`).value),
              },
            ],
          },
          quantity: parseInt(document.querySelector(`[name="item-quantity-${itemId}"]`).value),
          size_breakdown: document.querySelector(`[name="item-size-breakdown-${itemId}"]`).value,
          item_notes: document.querySelector(`[name="item-notes-${itemId}"]`).value,
        })),
      },
    };

    try {
      const response = await fetch('https://printmanager-api.onrender.com/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create order');
      }
      setCustomerData({ name: '', email: '', mobile: '', mobile2: '', company: '', address: '' });
      setIsCustomerSelected(false);
      setOrderData({ orderTitle: '', dueDate: '', status: 'Draft', notes: '' });
      setOrderItems([1]);
      setItemCounter(1);
      setCustomerId('');
      setCustomers([]);
      toast.success('Order created successfully');
      setTimeout(() => {
       router.push('/dashboard/order/list');
      }, 3000);
    } catch (err) {
      toast.error(err.message || 'An error occurred while creating the order');
    } finally {
      setLoading(false);
    }
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.customer-search')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Add initial order item
  useEffect(() => {
    setOrderItems([1]);
    setItemCounter(1);
  }, []);

  // Handle customer search input focus for positioning
  const handleSearchFocus = (e) => {
    const rect = e.target.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

//   className="bg-white p-8 rounded-lg w-full border-[1px] border-[#e5e7eb]"

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        {/* Customer Information */}
        <div className="bg-white p-8 rounded-lg w-full border-[1px] border-[#e5e7eb]">
          <h3 className="text-lg font-semibold text-[#111928] mb-4">Customer Information</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#111928] mb-2">Search Customer by ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                onFocus={handleSearchFocus}
                placeholder="Enter Customer ID"
                className="customer-search w-full sm:w-1/3 px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              />
              <button
                type="button"
                onClick={handleSearchCustomer}
                className={`py-2 px-4 bg-[#5750f1] text-white rounded-lg hover:bg-blue-700 flex items-center ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                ) : null}
                {loading ? 'Searching...' : 'Search Customer'}
              </button>
              {isCustomerSelected && (
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="py-2 px-4 bg-gray-200 text-[#111928] rounded-lg hover:bg-gray-300"
                >
                  Clear Customer
                </button>
              )}
            </div>
          </div>
          <CustomerSearchDropdown
            customers={customers}
            menuOpen={menuOpen}
            menuPosition={menuPosition}
            onSelectCustomer={handleSelectCustomer}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111928]">Name</label>
              <input
                type="text"
                name="name"
                value={customerData.name}
                onChange={handleCustomerChange}
                className={`w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] ${
                  isCustomerSelected ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={isCustomerSelected}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">Email</label>
              <input
                type="email"
                name="email"
                value={customerData.email}
                onChange={handleCustomerChange}
                className={`w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] ${
                  isCustomerSelected ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={isCustomerSelected}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={customerData.mobile}
                onChange={handleCustomerChange}
                className={`w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] ${
                  isCustomerSelected ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={isCustomerSelected}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">Mobile 2</label>
              <input
                type="tel"
                name="mobile2"
                value={customerData.mobile2}
                onChange={handleCustomerChange}
                className={`w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] ${
                  isCustomerSelected ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={isCustomerSelected}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">Company</label>
              <input
                type="text"
                name="company"
                value={customerData.company}
                onChange={handleCustomerChange}
                className={`w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] ${
                  isCustomerSelected ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={isCustomerSelected}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">Address</label>
              <textarea
                name="address"
                value={customerData.address}
                onChange={handleCustomerChange}
                className={`w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] ${
                  isCustomerSelected ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                rows="3"
                disabled={isCustomerSelected}
              />
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white p-8 rounded-lg w-full border-[1px] border-[#e5e7eb]">
          <h3 className="text-lg font-semibold text-[#111928] mb-4">Order Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111928]">Order Title</label>
              <input
                type="text"
                name="orderTitle"
                value={orderData.orderTitle}
                onChange={handleOrderChange}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={orderData.dueDate}
                onChange={handleOrderChange}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">Status</label>
              <select
                name="status"
                value={orderData.status}
                onChange={handleOrderChange}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                required
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928]">Order Notes</label>
              <textarea
                name="notes"
                value={orderData.notes}
                onChange={handleOrderChange}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="bg-white flex justify-between items-center mb-7 p-8 rounded-lg w-full border-[1px] border-[#e5e7eb]">
            <h3 className="text-lg font-semibold text-[#111928]">Order Items</h3>
            <button
              type="button"
              onClick={addOrderItem}
              className="py-2 px-4 bg-gray-200 text-[#111928] rounded-lg hover:bg-gray-300"
            >
              Add Item
            </button>
          </div>
          {orderItems.map((itemId) => (
            <OrderItem key={itemId} itemId={itemId} onRemove={removeOrderItem} />
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`py-3 px-8 bg-[#5750f1] text-white rounded-lg hover:bg-blue-700 flex items-center ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            disabled={loading}
          >
            {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
            ) : null}
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      </form>
      <ToastContainer />
    </>
  );
}