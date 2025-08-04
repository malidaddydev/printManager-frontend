"use client";
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DashboardCard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalCustomers: 0,
    overdueOrders: 0,
    monthlyChange: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch orders
        const ordersResponse = await fetch('https://printmanager-api.onrender.com/api/orders');
        if (!ordersResponse.ok) {
          const errorData = await ordersResponse.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
        const orders = await ordersResponse.json();
        const ordersArray = Array.isArray(orders) ? orders : [];

        // Fetch customers
        const customersResponse = await fetch('https://printmanager-api.onrender.com/api/customers');
        if (!customersResponse.ok) {
          const errorData = await customersResponse.json();
          throw new Error(errorData.message || 'Failed to fetch customers');
        }
        const customers = await customersResponse.json();
        const customersArray = Array.isArray(customers) ? customers : [];

        // Current and previous month for percentage change
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Calculate stats
        const totalOrders = ordersArray.length;
        const activeOrders = ordersArray.filter(order => 
          ['draft', 'confirmed', 'in progress'].includes(order.status?.toLowerCase()) &&
          (!order.dueDate || new Date(order.dueDate) >= currentDate)
        ).length;
        const overdueOrders = ordersArray.filter(order => 
          order.dueDate && new Date(order.dueDate) < currentDate
        ).length;
        const totalCustomers = new Set(customersArray.map(customer => customer.id)).size;

        // Calculate orders for current and previous month
        const currentMonthOrders = ordersArray.filter(order => {
          const orderDate = new Date(order.startDate || order.createdAt);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        }).length;
        const previousMonthOrders = ordersArray.filter(order => {
          const orderDate = new Date(order.startDate || order.createdAt);
          return orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousYear;
        }).length;

        // Calculate percentage change
        let monthlyChange = 0;
        if (previousMonthOrders > 0) {
          monthlyChange = ((currentMonthOrders - previousMonthOrders) / previousMonthOrders * 100).toFixed(1);
        } else if (currentMonthOrders > 0) {
          monthlyChange = 100; // If no previous orders, treat as 100% increase
        }

        setStats({
          totalOrders,
          activeOrders,
          totalCustomers,
          overdueOrders,
          monthlyChange: parseFloat(monthlyChange),
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message);
        toast.error(error.message || 'Error fetching dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {/* Total Orders */}
        <div className="rounded-[10px] bg-white p-6 border-[1px] border-[#e5e7eb]">
          <div className="bg-[#FF9C55] w-[60px] h-[60px] rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="#FF9C55" stroke="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 6h10m-10 4h10"></path>
            </svg>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <dl>
              <dt className="mb-1.5 text-[24px] font-bold text-[#111928]">
                {isLoading ? '...' : stats.totalOrders}
              </dt>
              <dd className="text-sm font-medium text-[#9ca3af]">Total Orders</dd>
            </dl>
            <dl className={`text-sm font-medium ${stats.monthlyChange >= 0 ? 'text-[#22ad5c]' : 'text-[#ef4444]'}`}>
              <dt className="flex items-center gap-1.5">
                {isLoading ? '...' : `${stats.monthlyChange >= 0 ? '+' : ''}${stats.monthlyChange}%`} 
                <span className="text-[#9ca3af]">from last month</span>
              </dt>
            </dl>
          </div>
        </div>

        {/* Active Orders */}
        <div className="rounded-[10px] bg-white p-6 border-[1px] border-[#e5e7eb]">
          <div className="bg-[#3FD97F] w-[60px] h-[60px] rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="#3FD97F" stroke="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <dl>
              <dt className="mb-1.5 text-[24px] font-bold text-[#111928]">
                {isLoading ? '...' : stats.activeOrders}
              </dt>
              <dd className="text-sm font-medium text-[#9ca3af]">Active Orders</dd>
            </dl>
            <dl className="text-sm font-medium text-[#9ca3af]">
              <dt className="flex items-center gap-1.5">currently in progress</dt>
            </dl>
          </div>
        </div>

        {/* Total Customers */}
        <div className="rounded-[10px] bg-white p-6 border-[1px] border-[#e5e7eb]">
          <div className="bg-[#8155FF] w-[60px] h-[60px] rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="#8155FF" stroke="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zm-7 14a3 3 0 013-3h8a3 3 0 013 3v2H5v-2z"></path>
            </svg>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <dl>
              <dt className="mb-1.5 text-[24px] font-bold text-[#111928]">
                {isLoading ? '...' : stats.totalCustomers}
              </dt>
              <dd className="text-sm font-medium text-[#9ca3af]">Total Customers</dd>
            </dl>
            <dl className="text-sm font-medium text-[#22ad5c]">
              <dt className="flex items-center gap-1.5">
                {isLoading ? '...' : `+${stats.totalCustomers}`} 
                <span className="text-[#9ca3af]">total registered</span>
              </dt>
            </dl>
          </div>
        </div>

        {/* Overdue Orders */}
        <div className="rounded-[10px] bg-white p-6 border-[1px] border-[#e5e7eb]">
          <div className="bg-[#ef4444] w-[60px] h-[60px] rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="#ef4444" stroke="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2zm6 3v6l2 2m-2-8v1"/>
            </svg>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <dl>
              <dt className="mb-1.5 text-[24px] font-bold text-[#111928]">
                {isLoading ? '...' : stats.overdueOrders}
              </dt>
              <dd className="text-sm font-medium text-[#9ca3af]">Overdue Orders</dd>
            </dl>
            <dl className="text-sm font-medium text-[#9ca3af]">
              <dt className="flex items-center gap-1.5">Needs immediate attention</dt>
            </dl>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default DashboardCard;