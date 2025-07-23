"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateOrder() {
  const router = useRouter();
  const [orderData, setOrderData] = useState({
    customerId: '',
    orderNumber: '',
    title: '',
    status: 'Draft',
    startDate: '',
    dueDate: '',
    notes: '',
    items: [],
    total: 0,
    totalQuantity: 0,
    files: null,
  });
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch products and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await fetch('https://printmanager-api.onrender.com/api/products');
        if (!productsRes.ok) throw new Error('Failed to fetch products');
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);

        const servicesRes = await fetch('https://printmanager-api.onrender.com/api/services');
        if (!servicesRes.ok) throw new Error('Failed to fetch services');
        const servicesData = await servicesRes.json();
        setServices(Array.isArray(servicesData) ? servicesData : servicesData.services || []);
      } catch (err) {
        toast.error(err.message || 'Error fetching data');
      }
    };
    fetchData();
  }, []);

  // Handle customer ID search
  const handleCustomerSearch = async (customerId) => {
    if (!customerId) return;
    try {
      const res = await fetch(`https://printmanager-api.onrender.com/api/customers/${customerId}`);
      if (!res.ok) throw new Error('Customer not found');
      const data = await res.json();
      setCustomerInfo(data);
      setOrderData(prev => ({ ...prev, customerId }));
    } catch (err) {
      toast.error(err.message || 'Error fetching customer');
      setCustomerInfo(null);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customerId') {
      handleCustomerSearch(value);
    } else {
      setOrderData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File size must be less than 5MB');
          return;
        }
      }
      setOrderData(prev => ({ ...prev, files }));
    }
  };

  // Add new item
  const addItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        color: '',
        sizeQuantities: [],
        productTitle: '',
        serviceTitle: '',
        image: '',
        total: 0,
        quantity: 0
      }]
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (orderData.items.length > 1) {
      setOrderData(prev => {
        const newItems = [...prev.items];
        newItems.splice(index, 1);
        return updateTotals({ ...prev, items: newItems });
      });
    }
  };

  // Add size to item
  const addSize = (itemIndex) => {
    setOrderData(prev => {
      const newItems = [...prev.items];
      // Ensure only one size is added
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        sizeQuantities: [...newItems[itemIndex].sizeQuantities, { Size: '', Price: 0, Quantity: 0 }]
      };
      return updateTotals({ ...prev, items: newItems });
    });
  };

  // Remove size
  const removeSize = (itemIndex, sizeIndex) => {
    setOrderData(prev => {
      const newItems = [...prev.items];
      newItems[itemIndex].sizeQuantities.splice(sizeIndex, 1);
      return updateTotals({ ...prev, items: newItems });
    });
  };

  // Handle item changes
  const handleItemChange = (itemIndex, field, value) => {
    setOrderData(prev => {
      const newItems = [...prev.items];
      if (field === 'productId') {
        const product = products.find(p => p.id === parseInt(value));
        if (product) {
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            productId: value,
            productTitle: product.title,
            serviceTitle: services.find(s => s.id === product.serviceId)?.title || '',
            image: product.imageUrl || '',
            colorOptions: product.colorOptions || [],
            color: '',
            unitPrice: product.unitPrice || 0
          };
        }
      } else {
        newItems[itemIndex][field] = value;
      }
      return updateTotals({ ...prev, items: newItems });
    });
  };

  // Handle size quantity changes
  const handleSizeChange = (itemIndex, sizeIndex, field, value) => {
    setOrderData(prev => {
      const newItems = [...prev.items];
      newItems[itemIndex].sizeQuantities[sizeIndex][field] = 
        field === 'Price' || field === 'Quantity' ? parseFloat(value) || 0 : value;
      if (field === 'Quantity' && value) {
        newItems[itemIndex].sizeQuantities[sizeIndex].Quantity = parseInt(value) || 0;
        newItems[itemIndex].sizeQuantities[sizeIndex].Price = newItems[itemIndex].unitPrice || 0;
      }
      return updateTotals({ ...prev, items: newItems });
    });
  };

  // Update totals
  const updateTotals = (data) => {
    let total = 0;
    let totalQuantity = 0;
    const updatedItems = data.items.map(item => {
      const itemTotal = item.sizeQuantities.reduce((sum, size) => {
        return sum + (size.Price * size.Quantity);
      }, 0);
      const itemQuantity = item.sizeQuantities.reduce((sum, size) => sum + size.Quantity, 0);
      total += itemTotal;
      totalQuantity += itemQuantity;
      return { 
        ...item, 
        total: itemTotal, 
        quantity: itemQuantity,
        price: itemTotal,
        quantity: itemQuantity
      };
    });
    return { ...data, items: updatedItems, total, totalQuantity };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderData.customerId || !orderData.orderNumber || !orderData.title || !orderData.dueDate || !orderData.items.length) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    // Add individual fields
    formData.append('customerId', parseInt(orderData.customerId));
    formData.append('orderNumber', orderData.orderNumber);
    formData.append('title', orderData.title);
    formData.append('status', orderData.status);
    if (orderData.startDate) {
      formData.append('startDate', new Date(orderData.startDate).toISOString());
    }
    formData.append('dueDate', new Date(orderData.dueDate).toISOString());
    if (orderData.notes) {
      formData.append('notes', orderData.notes);
    }

    // Add items as JSON string
    const itemsData = orderData.items.map(item => ({
      productId: parseInt(item.productId),
      color: item.color,
      quantity: item.quantity,
      price: item.total,
      sizeQuantities: item.sizeQuantities.map(size => ({
        Size: size.Size,
        Price: parseFloat(size.Price),
        Quantity: parseInt(size.Quantity)
      }))
    }));
    formData.append('items', JSON.stringify(itemsData));

    // Add files
    if (orderData.files) {
      for (let file of orderData.files) {
        formData.append('files', file);
      }
    }

    try {
      const response = await fetch('https://printmanager-api.onrender.com/api/orders', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      toast.success('Order created successfully');
      setOrderData({
        customerId: '',
        orderNumber: '',
        title: '',
        status: 'Draft',
        startDate: '',
        dueDate: '',
        notes: '',
        items: [],
        total: 0,
        totalQuantity: 0,
        files: null
      });
      setCustomerInfo(null);
      fileInputRef.current.value = '';
      setTimeout(() => router.push('/dashboard/order/list'), 2000);
    } catch (err) {
      toast.error(err.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      <div className="bg-white p-8 rounded-lg w-full border-[1px] border-[#e5e7eb]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#111928] after:content-['*'] after:text-[#ef4444]">
              Customer ID
            </label>
            <input
              type="number"
              name="customerId"
              value={orderData.customerId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
            {customerInfo && (
              <div className="mt-2 text-sm text-[#111928]">
                Customer: {customerInfo.name} {customerInfo.email && `(${customerInfo.email})`}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111928] after:content-['*'] after:text-[#ef4444]">
              Order Number
            </label>
            <input
              type="text"
              name="orderNumber"
              value={orderData.orderNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111928] after:content-['*'] after:text-[#ef4444]">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={orderData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111928]">Status</label>
            <select
              name="status"
              value={orderData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            >
              <option value="Draft">Draft</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111928]">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={orderData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111928] after:content-['*'] after:text-[#ef4444]">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={orderData.dueDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-[#111928]">Notes</label>
            <textarea
              name="notes"
              value={orderData.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
            />
            <div className="mt-2">
              <label className="block text-sm font-medium text-[#111928]">Upload Files</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg"
              />
              {orderData.files && (
                <div className="mt-2">
                  {Array.from(orderData.files).map((file, index) => (
                    <div key={index} className="flex justify-between p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderData(prev => ({
                            ...prev,
                            files: Array.from(prev.files).filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-[#ef4444]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 border-[#e5e7eb]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-[#111928]">Order Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="py-2 px-4 bg-[#5750f1] text-white rounded-lg hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>

          {orderData.items.map((item, itemIndex) => (
            <div key={itemIndex} className="mb-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-[#111928]">Item #{itemIndex + 1}</h3>
                {orderData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(itemIndex)}
                    className="text-[#ef4444] text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111928] after:content-['*'] after:text-[#ef4444]">
                    Product ID
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(itemIndex, 'productId', e.target.value)}
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.id} - {product.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111928]">Color</label>
                  <select
                    value={item.color}
                    onChange={(e) => handleItemChange(itemIndex, 'color', e.target.value)}
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                  >
                    <option value="">Select Color</option>
                    {item.colorOptions?.map((color, i) => (
                      <option key={i} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                {item.image && (
                  <div>
                    <label className="block text-sm font-medium text-[#111928]">Product Image</label>
                    <img src={item.image} alt="Product" className="h-24 object-contain" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#111928]">Service</label>
                  <input
                    type="text"
                    value={item.serviceTitle}
                    readOnly
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111928]">Item Total</label>
                  <input
                    type="number"
                    value={item.total}
                    readOnly
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111928]">Total Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    readOnly
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-[#111928]">Size Quantities</h4>
                  <button
                    type="button"
                    onClick={() => addSize(itemIndex)}
                    className="py-1 px-3 bg-[#5750f1] text-white rounded-lg text-sm hover:bg-blue-700"
                    disabled={loading}
                  >
                    Add Size
                  </button>
                </div>

                {item.sizeQuantities.map((size, sizeIndex) => (
                  <div key={sizeIndex} className="flex gap-4 mb-2 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#111928]">Size</label>
                      <input
                        type="text"
                        value={size.Size}
                        onChange={(e) => handleSizeChange(itemIndex, sizeIndex, 'Size', e.target.value)}
                        className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#111928]">Price</label>
                      <input
                        type="number"
                        value={size.Price}
                        onChange={(e) => handleSizeChange(itemIndex, sizeIndex, 'Price', e.target.value)}
                        className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#111928]">Quantity</label>
                      <input
                        type="number"
                        value={size.Quantity}
                        onChange={(e) => handleSizeChange(itemIndex, sizeIndex, 'Quantity', e.target.value)}
                        className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSize(itemIndex, sizeIndex)}
                      className="text-[#ef4444] text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-[#111928]">Order Total: ${orderData.total.toFixed(2)}</span>
            <span className="ml-4 text-sm font-medium text-[#111928]">Total Quantity: {orderData.totalQuantity}</span>
          </div>
          <button
            type="submit"
            className={`py-3 px-8 bg-[#5750f1] text-white rounded-lg flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      </div>
      <ToastContainer />
    </form>
  );
}