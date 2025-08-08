'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Create() {
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    mobile2: '',
    company: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const mobileRef = useRef(null);
  const mobile2Ref = useRef(null);

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: '',
    });
  };

  const validateForm = () => {
    const newErrors = {};
    let firstInvalidField = null;

    if (!data.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
      if (!firstInvalidField) firstInvalidField = firstNameRef;
    }
    if (!data.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
      if (!firstInvalidField) firstInvalidField = lastNameRef;
    }
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
      if (!firstInvalidField) firstInvalidField = emailRef;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
      if (!firstInvalidField) firstInvalidField = emailRef;
    }
    if (!data.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      if (!firstInvalidField) firstInvalidField = mobileRef;
    } else if (!/^\d{10,15}$/.test(data.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number (10-15 digits)';
      if (!firstInvalidField) firstInvalidField = mobileRef;
    }
    if (data.mobile2 && !/^\d{10,15}$/.test(data.mobile2)) {
      newErrors.mobile2 = 'Please enter a valid secondary mobile number (10-15 digits)';
      if (!firstInvalidField) firstInvalidField = mobile2Ref;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (firstInvalidField.current) {
        firstInvalidField.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidField.current.focus();
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://printmanager-api.onrender.com/api/customers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setData({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          mobile2: '',
          company: '',
          address: '',
        });
        toast.success('Customer created successfully');
        setTimeout(() => {
          router.push('/dashboard/customer/list');
        }, 3000);
      } else {
        toast.error(result.message || 'Failed to create customer');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-[#e5e7eb] my-4 sm:my-6">
        {errors.general && (
          <div className="mb-4 text-red-600 text-center text-sm sm:text-base">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="firstName" className="block text-sm sm:text-base font-medium text-[#111928] mb-1 sm:mb-2">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={data.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-sm sm:text-base ${errors.firstName ? 'border-red-500' : 'border-[#e5e7eb]'}`}
              ref={firstNameRef}
            />
            {errors.firstName && (
              <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.firstName}</div>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm sm:text-base font-medium text-[#111928] mb-1 sm:mb-2">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={data.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-sm sm:text-base ${errors.lastName ? 'border-red-500' : 'border-[#e5e7eb]'}`}
              ref={lastNameRef}
            />
            {errors.lastName && (
              <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.lastName}</div>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-[#111928] mb-1 sm:mb-2">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter customer email"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-sm sm:text-base ${errors.email ? 'border-red-500' : 'border-[#e5e7eb]'}`}
              ref={emailRef}
            />
            {errors.email && (
              <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.email}</div>
            )}
          </div>
          <div>
            <label htmlFor="mobile" className="block text-sm sm:text-base font-medium text-[#111928] mb-1 sm:mb-2">Mobile *</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={data.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-sm sm:text-base ${errors.mobile ? 'border-red-500' : 'border-[#e5e7eb]'}`}
              ref={mobileRef}
            />
            {errors.mobile && (
              <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.mobile}</div>
            )}
          </div>
          <div>
            <label htmlFor="mobile2" className="block text-sm sm:text-base font-medium text-[#111928] mb-1 sm:mb-2">Mobile 2 (Optional)</label>
            <input
              type="tel"
              id="mobile2"
              name="mobile2"
              value={data.mobile2}
              onChange={handleChange}
              placeholder="Enter secondary mobile number"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-sm sm:text-base ${errors.mobile2 ? 'border-red-500' : 'border-[#e5e7eb]'}`}
              ref={mobile2Ref}
            />
            {errors.mobile2 && (
              <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.mobile2}</div>
            )}
          </div>
          <div>
            <label htmlFor="company" className="block text-sm sm:text-base font-medium text-[#111928] mb-1 sm:mb-2">Company (Optional)</label>
            <input
              type="text"
              id="company"
              name="company"
              value={data.company}
              onChange={handleChange}
              placeholder="Enter company name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-sm sm:text-base"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm sm:text-base font-medium text-[#111928] mb-1 sm:mb-2">Address (Optional)</label>
            <textarea
              id="address"
              name="address"
              value={data.address}
              onChange={handleChange}
              placeholder="Enter address"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-sm sm:text-base"
              rows="4"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#5750f1] text-white py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center transition ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading && (
              <svg className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Creating Customer...' : 'Create Customer'}
          </button>
        </form>
      </div>
    </div>
  );
}