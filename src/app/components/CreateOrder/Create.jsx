"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateOrder() {
  const router = useRouter();
  const [orderData, setOrderData] = useState({
    customerId: '',
    firstName: '',
    lastName: '',
    title: '',
    status: 'Draft',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    items: [],
    total: 0,
    totalQuantity: 0,
    files: [],
    createdBy: ''
  });
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [serviceDropdowns, setServiceDropdowns] = useState({}); // State for toggling service collapse
  const fileInputRefs = useRef([]);
  const [fileInputs, setFileInputs] = useState([0]);
  const [isItemCollapsed, setIsItemCollapsed] = useState({});

  // Fetch customers, products, and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersRes = await fetch('https://printmanager-api.onrender.com/api/customers');
        if (!customersRes.ok) throw new Error('Failed to fetch customers');
        const customersData = await customersRes.json();
        setCustomers(Array.isArray(customersData) ? customersData : customersData.customers || []);

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

  // Handle customer search
  const handleCustomerSearch = (searchTerm) => {
    if (searchTerm.length < 3) {
      setCustomerSearchResults([]);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    const results = customers.filter(customer =>
      customer.id.toString().includes(searchTerm) ||
      (customer.firstName && customer.firstName.toLowerCase().includes(lowerSearch)) ||
      (customer.lastName && customer.lastName.toLowerCase().includes(lowerSearch)) ||
      (customer.company && customer.company.toLowerCase().includes(lowerSearch)) ||
      (customer.email && customer.email.toLowerCase().includes(lowerSearch)) ||
      (customer.mobile && customer.mobile.toLowerCase().includes(lowerSearch))
    );
    setCustomerSearchResults(results.slice(0, 10));
  };

  // Handle customer selection
  const selectCustomer = async (customer) => {
    try {
      const res = await fetch(`https://printmanager-api.onrender.com/api/customers/${customer.id}`);
      if (!res.ok) throw new Error('Customer not found');
      const data = await res.json();
      setCustomerInfo(data);
      setOrderData(prev => ({
        ...prev,
        customerId: customer.id.toString(),
        firstName: customer.firstName || '',
        lastName: customer.lastName || ''
      }));
      setCustomerSearchResults([]);
    } catch (err) {
      toast.error(err.message || 'Error fetching customer');
      setCustomerInfo(null);
    }
  };

  // Toggle service dropdown for an item
  const toggleServiceDropdown = (itemIndex, serviceId) => {
    setServiceDropdowns(prev => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        [serviceId]: !prev[itemIndex]?.[serviceId]
      }
    }));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customerSearch') {
      setOrderData(prev => ({ ...prev, firstName: value, lastName: '' }));
      handleCustomerSearch(value);
    } else {
      setOrderData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle file upload
  const handleFileChange = (e, index) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File size must be less than 5MB');
          return;
        }
      }
      setOrderData(prev => {
        const newFiles = [...prev.files];
        newFiles[index] = files[0];
        return { ...prev, files: newFiles };
      });
    }
  };

  // Add new file input
  const addFileInput = () => {
    setFileInputs(prev => [...prev, prev.length]);
  };

  // Remove file input
  const removeFileInput = (index) => {
    if (fileInputs.length > 1) {
      setFileInputs(prev => prev.filter((_, i) => i !== index));
      setOrderData(prev => {
        const newFiles = prev.files.filter((_, i) => i !== index);
        return { ...prev, files: newFiles };
      });
    }
  };

  // Add new item
  const addItem = () => {
    setOrderData(prev => {
      const newItems = [...prev.items, {
        productId: '',
        color: '',
        size: '',
        sizeQuantities: [],
        productTitle: '',
        serviceTitle: '',
        image: '',
        total: 0,
        quantity: 0
      }];
      setIsItemCollapsed(prev => ({ ...prev, [newItems.length - 1]: false }));
      return updateTotals({ ...prev, items: newItems });
    });
  };

  // Remove item
  const removeItem = (index) => {
    if (orderData.items.length > 1) {
      setOrderData(prev => {
        const newItems = [...prev.items];
        newItems.splice(index, 1);
        const newCollapsed = { ...isItemCollapsed };
        delete newCollapsed[index];
        setIsItemCollapsed(newCollapsed);
        return updateTotals({ ...prev, items: newItems });
      });
      setServiceDropdowns(prev => {
        const newDropdowns = { ...prev };
        delete newDropdowns[index];
        return newDropdowns;
      });
    }
  };

  // Toggle item collapse
  const toggleItemCollapse = (index) => {
    setIsItemCollapsed(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Add size
  const addSize = (itemIndex) => {
    setOrderData(prev => {
      const newItems = [...prev.items];
      const item = newItems[itemIndex];
      if (!item.unitPrice) {
        toast.error('Please select a product with a valid price before adding a size.');
        return prev;
      }
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        sizeQuantities: [...newItems[itemIndex].sizeQuantities, { Size: '', Price: item.unitPrice, Quantity: 1 }]
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
  const handleItemChange = async (itemIndex, field, value) => {
    if (field === 'productId') {
      try {
        const res = await fetch(`https://printmanager-api.onrender.com/api/products/${value}`);
        if (!res.ok) throw new Error('Product not found');
        const product = await res.json();
        setOrderData(prev => {
          const newItems = [...prev.items];
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            productId: value,
            productTitle: product.title || '',
            serviceTitle: services.find(s => s.id === product.serviceId)?.title || '',
            image: product.files?.[0]?.filePath
              ? `${product.files[0].filePath}`
              : '',
            colorOptions: product.colorOptions || [],
            sizeOptions: product.sizeOptions || [],
            color: '',
            size: '',
            unitPrice: product.unitPrice || 0
          };
          return updateTotals({ ...prev, items: newItems });
        });
        setServiceDropdowns(prev => ({ ...prev, [itemIndex]: {} }));
      } catch (err) {
        toast.error(err.message || 'Error fetching product');
      }
    } else {
      setOrderData(prev => {
        const newItems = [...prev.items];
        newItems[itemIndex][field] = value;
        return updateTotals({ ...prev, items: newItems });
      });
    }
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
    if (!orderData.customerId || !orderData.title || !orderData.dueDate || !orderData.items.length) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    formData.append('customerId', parseInt(orderData.customerId));
    formData.append('title', orderData.title);
    formData.append('status', orderData.status);
    formData.append('createdBy', sessionStorage.getItem('username'));
    if (orderData.startDate) {
      formData.append('startDate', new Date(orderData.startDate).toISOString());
    }
    formData.append('dueDate', new Date(orderData.dueDate).toISOString());
    if (orderData.notes) {
      formData.append('notes', orderData.notes);
    }

    const itemsData = orderData.items.map(item => ({
      productId: parseInt(item.productId),
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      price: item.total,
      sizeQuantities: item.sizeQuantities.map(size => ({
        Size: size.Size,
        Price: parseFloat(size.Price),
        Quantity: parseInt(size.Quantity)
      }))
    }));
    formData.append('items', JSON.stringify(itemsData));

    if (orderData.files) {
      for (let file of orderData.files) {
        if (file) {
          formData.append('files', file);
        }
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
        firstName: '',
        lastName: '',
        title: '',
        status: 'Draft',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
        items: [],
        total: 0,
        totalQuantity: 0,
        files: [],
        createdBy: ''
      });
      setCustomerInfo(null);
      setCustomerSearchResults([]);
      setServiceDropdowns({});
      setFileInputs([0]);
      fileInputRefs.current.forEach(ref => ref && (ref.value = ''));
      setTimeout(() => router.push('/dashboard/order/list'), 2000);
    } catch (err) {
      toast.error(err.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  // Group products by service for dropdown
  const groupedProducts = services.map(service => ({
    ...service,
    products: products.filter(product => product.serviceId === service.id)
  }));

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="flex flex-col gap-4 sm:gap-6 md:gap-7 w-full mx-auto">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full border-[1px] border-[#e5e7eb]">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div className="relative">
            <label className="block text-xs sm:text-sm font-medium text-[#111928] after:content-['*'] after:text-[#ef4444]">
              Customer
            </label>
            <input
              type="text"
              name="customerSearch"
              value={orderData.firstName}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
              placeholder="Search by first name, last name, company, email, or mobile"
            />
            {customerSearchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg max-h-[40vh] sm:max-h-[50vh] overflow-auto">
                {customerSearchResults.map(customer => (
                  <div
                    key={customer.id}
                    className="px-3 sm:px-4 py-2 hover:bg-[#f8fafc] cursor-pointer text-xs sm:text-sm"
                    onClick={() => selectCustomer(customer)}
                  >
                    {customer.firstName} {customer.lastName} ({customer.company}, {customer.email}, {customer.mobile})
                  </div>
                ))}
              </div>
            )}
            {customerInfo && (
              <div className="mt-2 text-xs sm:text-sm text-[#111928]">
                Customer: {customerInfo.firstName} {customerInfo.lastName} {customerInfo.email && `(${customerInfo.email})`} {`(${customerInfo.mobile})`}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] after:content-['*'] after:text-[#ef4444]">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={orderData.title}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928]">Status</label>
            <select
              name="status"
              value={orderData.status}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            >
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928]">Start Date</label>
            <input
              type="date"
              name="startDate"
              min={today}
              value={orderData.startDate}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] after:content-['*'] after:text-[#ef4444]">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              min={today}
              value={orderData.dueDate}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-[#111928]">Notes</label>
            <textarea
              name="notes"
              value={orderData.notes}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            />
            <div className="mt-2 sm:mt-3">
              <label className="block text-xs sm:text-sm font-medium text-[#111928]">Upload Files</label>
              {fileInputs.map((_, index) => (
                <div key={index} className="flex items-center gap-2 mb-2 sm:mb-3">
                  <input
                    type="file"
                    ref={el => fileInputRefs.current[index] = el}
                    onChange={(e) => handleFileChange(e, index)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg text-xs sm:text-sm"
                  />
                  {fileInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFileInput(index)}
                      className="text-[#ef4444] text-xs sm:text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFileInput}
                className="mt-1 sm:mt-2 py-1 sm:py-1.5 px-2 sm:px-3 bg-[#5750f1] text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700"
              >
                More Files
              </button>
              {orderData.files.length > 0 && (
                <div className="mt-2 sm:mt-3">
                  {orderData.files.map((file, index) => (
                    file && (
                      <div key={index} className="flex justify-between p-2 sm:p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg mb-2 text-xs sm:text-sm">
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOrderData(prev => ({
                              ...prev,
                              files: prev.files.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-[#ef4444]"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-5 md:pt-6 border-[#e2e8f0] border-t-[2px]">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-medium text-[#111928]">Order Items</h2>
          </div>

          {orderData.items.map((item, itemIndex) => (
            <div key={itemIndex} className="mb-3 sm:mb-4 bg-white border border-[#e2e8f0] rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
              <div
                className="flex justify-between items-center p-4 sm:p-5 md:p-6 cursor-pointer"
                onClick={() => toggleItemCollapse(itemIndex)}
              >
                <h3 className="text-sm sm:text-md md:text-lg font-medium text-[#111928]">
                  Item {item.productTitle ? `- ${item.productTitle}` : `#${itemIndex + 1}`}
                </h3>
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex justify-center items-center text-lg sm:text-xl font-normal border-[2px] border-[#5750f1] text-[#5750f1]">{isItemCollapsed[itemIndex] ? '+' : '−'}</span>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isItemCollapsed[itemIndex] ? 'max-h-0' : 'max-h-[1500px]'
                }`}
              >
                <div className="p-3 sm:p-4 md:p-5 mt-1 sm:mt-2">
                  {orderData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(itemIndex)}
                      className="text-[#ef4444] text-xs sm:text-sm mb-3 sm:mb-4 block cursor-pointer"
                    >
                      Remove
                    </button>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <div className="relative">
                      <label className="block text-xs sm:text-sm font-medium text-[#111928] after:content-['*'] after:text-[#ef4444]">
                        Product
                      </label>
                      <div className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg bg-[#f2f2f3] text-xs sm:text-sm cursor-pointer">
                        <div className="flex justify-between items-center" onClick={() => toggleServiceDropdown(itemIndex, 'main')}>
                          <span>{item.productTitle || 'Select Product'}</span>
                          <span>{serviceDropdowns[itemIndex]?.main ? '−' : '+'}</span>
                        </div>
                        {serviceDropdowns[itemIndex]?.main && (
                          <div className="absolute z-10 w-full mt-3 left-0 border border-[#e5e7eb] rounded-lg shadow-lg max-h-[40vh] sm:max-h-[50vh] overflow-auto bg-white">
                            {groupedProducts.map((service, serviceIndex) => (
                              <div key={service.id} className="border-b border-[#e5e7eb]">
                                <div
                                  className="px-3 sm:px-4 py-2 hover:bg-[#f8fafc] cursor-pointer flex justify-between items-center text-xs sm:text-sm"
                                  onClick={() => toggleServiceDropdown(itemIndex, service.id)}
                                >
                                  <span>{service.title}</span>
                                  <span>{serviceDropdowns[itemIndex]?.[service.id] ? '−' : '+'}</span>
                                </div>
                                {serviceDropdowns[itemIndex]?.[service.id] && (
                                  <div>
                                    {service.products.map(product => (
                                      <div
                                        key={product.id}
                                        className="w-full px-3 sm:px-4 py-2 hover:bg-[#f8fafc] cursor-pointer flex items-center gap-2 sm:gap-3 text-xs sm:text-sm"
                                        onClick={() => handleItemChange(itemIndex, 'productId', product.id.toString())}
                                      >
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#5750f1] rounded-full"></div>
                                        {product.title}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#111928]">Color</label>
                      <select
                        value={item.color}
                        onChange={(e) => handleItemChange(itemIndex, 'color', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] bg-[#f2f2f3] text-xs sm:text-sm"
                      >
                        <option value="">Select Color</option>
                        {item.colorOptions?.map((color, i) => (
                          <option key={i} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="w-full my-6 sm:my-8 md:my-10 rounded-lg border border-[#e5e7eb] p-3 sm:p-4 md:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
                    {item.image ? (
                      <div>
                        <img src={item.image} alt={item.productTitle} className="w-20 sm:w-24 md:w-[120px] object-contain rounded-lg border-[#e5e7eb] border" />
                      </div>
                    ) : (
                      <div>
                        <div className="h-16 sm:h-20 md:h-24 flex items-center justify-center text-xs sm:text-sm text-[#6b7280]">
                          No image available
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm sm:text-base md:text-[18px] text-[#111928]">{item.productTitle}</div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="text-[#6b7280]">Color: {item.color || 'Not selected'}</div>
                        <div className="text-[#6b7280]">Service: {item.serviceTitle || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="border border-[#e5e7eb] px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-1 sm:gap-2">
                      <h5 className="font-bold text-[#111928] text-sm sm:text-[16px]">Total:</h5>
                      <h5 className="text-[#6b7280] text-xs sm:text-[15px]">${item.total}</h5>
                    </div>
                    <div className="border border-[#e5e7eb] px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-1 sm:gap-2">
                      <h5 className="font-bold text-[#111928] text-sm sm:text-[16px]">Quantity:</h5>
                      <h5 className="text-[#6b7280] text-xs sm:text-[15px]">{item.quantity}</h5>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <h4 className="text-xs sm:text-sm font-medium text-[#111928]">Size Quantities</h4>
                      <button
                        type="button"
                        onClick={() => addSize(itemIndex)}
                        className="py-1 sm:py-1.5 px-2 sm:px-3 bg-[#5750f1] text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700"
                        disabled={loading}
                      >
                        Add Size
                      </button>
                    </div>

                    {item.sizeQuantities.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-2 sm:mb-3 items-start sm:items-end">
                        <div className="flex-1">
                          <label className="block text-xs sm:text-sm font-medium text-[#111928]">Size</label>
                          <select
                            value={size.Size}
                            onChange={(e) => handleSizeChange(itemIndex, sizeIndex, 'Size', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] bg-[#f2f2f3] text-xs sm:text-sm"
                          >
                            <option value="">Select Size</option>
                            {item.sizeOptions?.map((size, i) => (
                              <option key={i} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs sm:text-sm font-medium text-[#111928]">Price</label>
                          <input
                            type="text"
                            value={size.Price}
                            onChange={(e) => handleSizeChange(itemIndex, sizeIndex, 'Price', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] bg-[#f2f2f3] text-xs sm:text-sm"
                            disabled
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs sm:text-sm font-medium text-[#111928]">Quantity</label>
                          <input
                            type="number"
                            value={size.Quantity}
                            onChange={(e) => handleSizeChange(itemIndex, sizeIndex, 'Quantity', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] bg-[#f2f2f3] text-xs sm:text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSize(itemIndex, sizeIndex)}
                          className="text-[#ef4444] text-xs sm:text-sm cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex">
          <button
            type="button"
            onClick={addItem}
            className="py-1.5 sm:py-2 px-3 sm:px-4 bg-[#5750f1] text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700"
          >
            Add Item
          </button>
        </div>

        <div className="mt-4 sm:mt-6 w-full flex flex-col items-end gap-4 sm:gap-6 md:gap-8">
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
            <div className="text-xs sm:text-sm font-medium text-[#111928] flex justify-between w-full mb-3 sm:mb-4">
              <h5 className="text-[#111928] font-medium text-sm sm:text-[17px]">Total Quantity:</h5>
              <h5 className="text-[#111928] font-medium text-sm sm:text-[17px]">{orderData.totalQuantity}</h5>
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#111928] flex justify-between w-full border-t border-[#e5e7eb] pt-3 sm:pt-4">
              <h5 className="text-[#111928] font-medium text-sm sm:text-[17px]">Order Total:</h5>
              <h5 className="text-[#111928] font-medium text-sm sm:text-[17px]">${orderData.total}</h5>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              onClick={handleSubmit}
              className={`py-2 sm:py-3 px-6 sm:px-8 bg-[#5750f1] text-white rounded-lg flex items-center text-xs sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
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
      </div>
      <ToastContainer />
    </form>
  );
}