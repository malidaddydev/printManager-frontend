"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BASE_URL = 'https://printmanager-api.onrender.com';

const ViewImagePopup = ({ isOpen, onClose, filePath }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-[90vw] sm:max-w-[500px] shadow-xl transform transition-all duration-300 ease-in-out animate-popup">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">Product Image</h2>
        {filePath ? (
          <img src={filePath} alt="Product" className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain mb-3 sm:mb-4" />
        ) : (
          <p className="text-xs sm:text-sm text-[#111928] mb-3 sm:mb-4">No image provided</p>
        )}
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

export function CheckIcon({ className }) {
  return (
    <svg
      width="10"
      height="8"
      viewBox="0 0 11 8"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.2355 0.812752L10.2452 0.824547C10.4585 1.08224 10.4617 1.48728 10.1855 1.74621L4.85633 7.09869C4.66442 7.29617 4.41535 7.4001 4.14693 7.4001C3.89823 7.4001 3.63296 7.29979 3.43735 7.09851L0.788615 4.43129C0.536589 4.1703 0.536617 3.758 0.788643 3.49701C1.04747 3.22897 1.4675 3.22816 1.72731 3.49457L4.16182 5.94608L9.28643 0.799032C9.54626 0.532887 9.96609 0.533789 10.2248 0.801737L10.2355 0.812752Z"
        fill=""
      />
    </svg>
  );
}

function CustomCheckbox({ label, checked, onChange, name }) {
  const id = React.useId();

  return (
    <div className="mb-1.5 sm:mb-2">
      <label
        htmlFor={id}
        className="flex cursor-pointer select-none items-center text-xs sm:text-sm text-[#111928]"
      >
        <div className="relative">
          <input
            type="checkbox"
            name={name}
            id={id}
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
          />
          <div
            className="mr-1.5 sm:mr-2 flex size-4 sm:size-5 items-center justify-center rounded border border-[#e5e7eb] peer-checked:border-[#5750f1] peer-checked:bg-[#f3f4f6] [&>*]:text-[#5750f1] peer-checked:[&>*]:block"
          >
            <CheckIcon className="hidden text-[#5750f1]" />
          </div>
        </div>
        <span>{label}</span>
      </label>
    </div>
  );
}

const EditProductPopup = ({ isOpen, onClose, product, onSave, services }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: product?.title || '',
    unitPrice: product?.unitPrice ? product.unitPrice : '',
    category: product?.category || '',
    colorOptions: product?.colorOptions ? (Array.isArray(product.colorOptions) ? product.colorOptions : []) : [],
    sizeOptions: product?.sizeOptions ? (Array.isArray(product.sizeOptions) ? product.sizeOptions : []) : [],
    serviceId: product?.serviceId || '',
    files: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const colorOptions = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Purple', 'Orange'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'XL', 'XXL'];
  const categoryOptions = ['GOODS_WITH_SERVICE', 'SERVICE'];

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        unitPrice: product.unitPrice ? product.unitPrice : '',
        category: product.category || '',
        colorOptions: product.colorOptions ? (Array.isArray(product.colorOptions) ? product.colorOptions : []) : [],
        sizeOptions: product.sizeOptions ? (Array.isArray(product.sizeOptions) ? product.sizeOptions : []) : [],
        serviceId: product.serviceId || '',
        files: null,
      });
      setError(null);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleColorChange = (color) => {
    setFormData((prev) => {
      const newColors = prev.colorOptions.includes(color)
        ? prev.colorOptions.filter((c) => c !== color)
        : [...prev.colorOptions, color];
      return { ...prev, colorOptions: newColors };
    });
    setError(null);
  };

  const handleSizeChange = (size) => {
    setFormData((prev) => {
      const newSizes = prev.sizeOptions.includes(size)
        ? prev.sizeOptions.filter((s) => s !== size)
        : [...prev.sizeOptions, size];
      return { ...prev, sizeOptions: newSizes };
    });
    setError(null);
  };

  const handleImageUpload = (files) => {
    if (!files || !files[0] || !files[0].type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      setError('Please upload a valid image file');
      return;
    }
    if (files[0].size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      setError('Image size must be less than 5MB');
      return;
    }
    setFormData((prev) => ({ ...prev, files: files[0] }));
    setError(null);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    handleImageUpload(files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.unitPrice || !formData.category || !formData.serviceId || formData.colorOptions.length === 0 || formData.sizeOptions.length === 0) {
      toast.error('Please fill in all required fields');
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    const submitData = new FormData();
    submitData.append('title', formData.title);
    if (formData.files) {
      submitData.append('files', formData.files);
    } else if (product.files && product.files[0]?.filePath) {
      submitData.append('existingFilePath', product.files[0].filePath);
    }
    submitData.append('unitPrice', parseFloat(formData.unitPrice));
    submitData.append('category', formData.category);
    submitData.append('colorOptions', JSON.stringify(formData.colorOptions));
    submitData.append('sizeOptions', JSON.stringify(formData.sizeOptions));
    submitData.append('serviceId', parseInt(formData.serviceId));

    try {
      const response = await fetch(`${BASE_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        body: submitData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }
      const savedProduct = await response.json();
      toast.success('Product updated successfully');
      onSave({ id: product.id, ...savedProduct });
      fileInputRef.current.value = '';
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`Error updating product: ${error.message}`);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-[90vw] sm:max-w-[500px] max-h-[80vh] overflow-y-auto shadow-xl transform transition-all duration-300 ease-in-out animate-popup">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">Edit Product</h2>
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Product Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Product Image</label>
            <div
              className={`w-full h-24 sm:h-28 md:h-32 border-2 border-dashed border-[#e5e7eb] rounded-lg flex items-center justify-center text-[#111928] cursor-pointer ${
                dragActive ? 'bg-[#f7f9fc]' : ''
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleImageClick}
            >
              {formData.files ? (
                <img
                  src={URL.createObjectURL(formData.files)}
                  alt="Product Preview"
                  className="h-full object-contain"
                />
              ) : product.files && product.files[0]?.filePath ? (
                <img
                  src={product.files[0].filePath}
                  alt="Product Preview"
                  className="h-full object-contain"
                />
              ) : (
                <p className="text-xs sm:text-sm">Drag and drop an image or click to upload</p>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Unit Price ($) *</label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            >
              <option value="">Select Category</option>
              {categoryOptions.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Colors *</label>
            <div className="mt-1 sm:mt-2 max-h-28 sm:max-h-32 overflow-y-auto border border-[#e5e7eb] rounded-lg p-2 sm:p-3">
              {colorOptions.map((color, index) => (
                <CustomCheckbox
                  key={index}
                  label={color}
                  checked={formData.colorOptions.includes(color)}
                  onChange={() => handleColorChange(color)}
                  name={`color-${color}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Sizes *</label>
            <div className="mt-1 sm:mt-2 max-h-28 sm:max-h-32 overflow-y-auto border border-[#e5e7eb] rounded-lg p-2 sm:p-3">
              {sizeOptions.map((size, index) => (
                <CustomCheckbox
                  key={index}
                  label={size}
                  checked={formData.sizeOptions.includes(size)}
                  onChange={() => handleSizeChange(size)}
                  name={`size-${size}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928] mb-1 sm:mb-2">Service *</label>
            <select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            >
              <option value="">Select Service</option>
              {Array.isArray(services) && services.length > 0 ? (
                services.map((service, index) => (
                  <option key={index} value={service.id}>
                    {service.title}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No services available
                </option>
              )}
            </select>
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
              className={`py-2 sm:py-2.5 px-4 sm:px-6 bg-[#5750f1] text-white rounded-lg text-xs sm:text-sm flex items-center justify-center transition ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading && (
                <svg className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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

const DeleteProductPopup = ({ isOpen, onClose, productId, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      toast.success('Product deleted successfully');
      onDelete(productId);
      onClose();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`Error deleting product: ${error.message}`);
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
        <p className="text-xs sm:text-sm text-[#111928] mb-3 sm:mb-4">Are you sure you want to delete this product?</p>
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
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {loading ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DropdownMenu = ({ productId, menuPosition, menuOpen, onEdit, onDelete }) => {
  if (menuOpen !== productId) return null;
  return createPortal(
    <div
      className="absolute bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50 min-w-[120px] sm:min-w-[150px] overflow-hidden dropdown-menu"
      style={{
        top: `${menuPosition.top}px`,
        right: `${Math.max(16, menuPosition.right)}px`,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(productId);
        }}
        className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        Edit Product
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(productId);
        }}
        className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        Delete Product
      </button>
    </div>,
    document.getElementById('dropdown-portal') || document.body
  );
};

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewImage, setViewImage] = useState({ isOpen: false, filePath: '' });
  const [editProduct, setEditProduct] = useState({ isOpen: false, product: null });
  const [deleteProduct, setDeleteProduct] = useState({ isOpen: false, productId: null });
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();

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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/products`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const productsArray = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
        setProducts([]);
        setFilteredProducts([]);
        toast.error('Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/services`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        const servicesArray = Array.isArray(data)
          ? data
          : Array.isArray(data.services)
          ? data.services
          : [];
        setServices(servicesArray);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
        toast.error('Failed to fetch services');
      }
    };
    fetchServices();
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
      return sortOrder === 'asc' ? (
        <div className="ml-2 inline-flex flex-col space-y-[2px]">
          <svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor">
            <path d="M5 0L0 5H10L5 0Z" />
          </svg>
          <svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor" className="rotate-180">
            <path d="M5 0L0 5H10L5 0Z" />
          </svg>
        </div>
      ) : (
        <div className="ml-2 inline-flex flex-col space-y-[2px]">
          <svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor">
            <path d="M5 0L0 5H10L5 0Z" />
          </svg>
          <svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor" className="rotate-180">
            <path d="M5 0L0 5H10L5 0Z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="ml-2 inline-flex flex-col space-y-[2px]">
        <svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor">
          <path d="M5 0L0 5H10L5 0Z" />
        </svg>
        <svg width="10" height="5" viewBox="0 0 10 5" fill="currentColor" className="rotate-180">
          <path d="M5 0L0 5H10L5 0Z" />
        </svg>
      </div>
    );
  };

  // Filter and sort products
  useEffect(() => {
    const filtered = products
      .filter((product) =>
        [
          product.id?.toString(),
          product.title,
          product.service?.title || services.find((s) => s.id === product.serviceId)?.title || '',
        ].some((field) => field && field.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (!sortField) return 0;
        let valueA, valueB;

        if (sortField === 'service') {
          valueA = a.service?.title || services.find((s) => s.id === a.serviceId)?.title || '';
          valueB = b.service?.title || services.find((s) => s.id === b.serviceId)?.title || '';
        } else {
          valueA = a[sortField] || '';
          valueB = b[sortField] || '';
        }

        valueA = valueA.toString().toLowerCase();
        valueB = valueB.toString().toLowerCase();

        if (sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    setFilteredProducts(filtered);
  }, [searchTerm, products, services, sortField, sortOrder]);

  // Action handlers
  const handleEditProduct = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setEditProduct({ isOpen: true, product });
      setMenuOpen(null);
    } else {
      console.error('Product not found for productId:', productId);
      toast.error('Product not found');
    }
  };

  const handleDeleteProduct = (productId) => {
    setDeleteProduct({ isOpen: true, productId });
    setMenuOpen(null);
  };

  const handleSaveProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
    setFilteredProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
    setMenuOpen(null);
  };

  const handleDeleteProductConfirmed = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setFilteredProducts((prev) => prev.filter((p) => p.id !== productId));
    setMenuOpen(null);
  };

  // Handle menu open and position
  const handleMenuClick = (productId, event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const newPosition = {
      top: rect.bottom + window.scrollY,
      right: Math.max(16, window.innerWidth - rect.right + window.scrollX),
    };
    setMenuPosition(newPosition);
    setMenuOpen(menuOpen === productId ? null : productId);
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-[#e5e7eb] mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-1 sm:mb-2">Product Directory</h2>
            <p className="text-xs sm:text-sm text-[#9ca3af] mb-2 sm:mb-3">Search product catalog</p>
          </div>
          {isAllowed ? null : (
            <div className="sm:mb-0 mb-[20px]">
              <button
                onClick={() => router.push('/dashboard/products/create')}
                className="bg-[#5750f1] text-white py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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
                Create Product
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-5">
          <input
            type="text"
            placeholder="Search by ID, title, or service"
            className="w-full sm:w-1/2 md:w-1/3 px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 sm:mt-5 rounded-lg bg-white p-4 sm:p-5 md:p-6 border border-[#e5e7eb]">
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-10 text-[#ef4444] text-sm sm:text-base">
              Error: {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-[#9ca3af] text-sm sm:text-base">
              No products found
            </div>
          ) : (
            <table className="w-full caption-bottom text-xs sm:text-sm">
              <thead>
                <tr className="border-none bg-[#f7f9fc] text-[#111928]">
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[80px] sm:min-w-[100px] md:pl-6 cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      Product ID {renderSortIcon('id')}
                    </div>
                  </th>
                  <th className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[60px] sm:min-w-[80px]">
                    Image
                  </th>
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[100px] cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Title {renderSortIcon('title')}
                    </div>
                  </th>
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[100px] cursor-pointer"
                    onClick={() => handleSort('service')}
                  >
                    <div className="flex items-center">
                      Service {renderSortIcon('service')}
                    </div>
                  </th>
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[100px] cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Type {renderSortIcon('category')}
                    </div>
                  </th>
                  <th
                    className="h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[80px] cursor-pointer"
                    onClick={() => handleSort('unitPrice')}
                  >
                    <div className="flex items-center">
                      Price {renderSortIcon('unitPrice')}
                    </div>
                  </th>
                  {isAllowed ? null : (
                    <th className="h-10 sm:h-12 px-3 sm:px-4 text-right align-middle font-medium text-neutral-500 md:pr-6">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#e5e7eb] transition-colors hover:bg-neutral-100/50"
                  >
                    <td className="p-3 sm:p-4 align-middle min-w-[80px] sm:min-w-[100px] md:pl-6">
                      <p className="text-[#111928]">{product.id || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle min-w-[60px] sm:min-w-[80px]">
                      {product.files && product.files[0]?.filePath ? (
                        <img
                          src={product.files[0].filePath}
                          alt={product.title || 'Product'}
                          className="h-8 sm:h-10 w-8 sm:w-10 object-cover rounded cursor-pointer"
                          onClick={() => setViewImage({ isOpen: true, filePath: product.files[0].filePath })}
                        />
                      ) : (
                        <p className="text-[#111928]">N/A</p>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 align-middle min-w-[100px]">
                      <p className="text-[#111928]">{product.title || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle min-w-[100px]">
                      <p className="text-[#111928]">
                        {product.service?.title || services.find((s) => s.id === product.serviceId)?.title || product.serviceId || 'N/A'}
                      </p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle min-w-[100px]">
                      <p className="text-[#111928]">{product.category || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4 align-middle min-w-[80px]">
                      <p className="text-[#111928]">
                        {product.unitPrice ? `$${product.unitPrice}` : 'N/A'}
                      </p>
                    </td>
                    {isAllowed ? null : (
                      <td className="p-3 sm:p-4 align-middle md:pr-6">
                        <div className="relative flex justify-end">
                          <button
                            className="dropdown-button hover:text-[#2563eb] transition"
                            onClick={(e) => handleMenuClick(product.id, e)}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <circle cx="10" cy="4" r="2" />
                              <circle cx="10" cy="10" r="2" />
                              <circle cx="10" cy="16" r="2" />
                            </svg>
                          </button>
                          <DropdownMenu
                            productId={product.id}
                            menuPosition={menuPosition}
                            menuOpen={menuOpen}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
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
      <ViewImagePopup
        isOpen={viewImage.isOpen}
        onClose={() => setViewImage({ isOpen: false, filePath: '' })}
        filePath={viewImage.filePath}
      />
      <EditProductPopup
        isOpen={editProduct.isOpen}
        onClose={() => setEditProduct({ isOpen: false, product: null })}
        product={editProduct.product}
        onSave={handleSaveProduct}
        services={services}
      />
      <DeleteProductPopup
        isOpen={deleteProduct.isOpen}
        onClose={() => setDeleteProduct({ isOpen: false, productId: null })}
        productId={deleteProduct.productId}
        onDelete={handleDeleteProductConfirmed}
      />
    </div>
  );
}