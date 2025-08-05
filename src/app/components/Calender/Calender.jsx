"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateOrders, setSelectedDateOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const today = new Date();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('https://printmanager-api.onrender.com/api/orders', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        });
        setOrders(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Calendar navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar days
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Get orders for a specific date
  const getOrdersForDate = (date) => {
    if (!date || !Array.isArray(orders)) return [];
    return orders.filter(order => {
      if (!order.dueDate) return false;
      const dueDate = new Date(order.dueDate);
      return dueDate.toDateString() === date.toDateString();
    });
  };

  // Open modal with orders for the selected date
  const openModal = (date) => {
    const ordersForDate = getOrdersForDate(date);
    setSelectedDateOrders(ordersForDate);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDateOrders([]);
  };

  // Generate weeks for rendering
  const daysInMonth = getDaysInMonth();
  const weeks = [];
  let week = [];

  daysInMonth.forEach((day, index) => {
    week.push(day);
    if ((index + 1) % 7 === 0 || index === daysInMonth.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  const handelViewOrder = (orderId) => {
    router.push(`/dashboard/order/view/${orderId}`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4 sm:mb-5 bg-white p-4 sm:p-5 md:p-6 rounded-lg border border-[#e5e7eb] mt-4 sm:mt-6">
        <button
          onClick={prevMonth}
          className="py-2 sm:py-2.5 px-6 sm:px-8 md:px-10 bg-gray-200 rounded-full text-xs sm:text-sm hover:bg-gray-300 cursor-pointer mb-2 sm:mb-0"
        >
          Previous
        </button>
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928]">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={nextMonth}
          className="py-2 sm:py-2.5 px-6 sm:px-8 md:px-10 bg-[#5750f1] rounded-full text-xs sm:text-sm text-white cursor-pointer hover:bg-blue-700"
        >
          Next
        </button>
      </div>

      {loading && (
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
      )}
      {error && <p className="text-red-500 text-sm sm:text-base text-center mb-4">{error}</p>}

      <div className="w-full max-w-full rounded-lg bg-white shadow-sm border border-[#e5e7eb] overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="grid grid-cols-7 bg-[#5750f1] text-white rounded-t-lg">
              <th className="flex h-12 sm:h-14 items-center justify-center rounded-tl-lg p-1 sm:p-2 text-xs sm:text-sm md:text-base font-medium">
                <span className="hidden lg:block">Sunday</span>
                <span className="block lg:hidden">Sun</span>
              </th>
              <th className="flex h-12 sm:h-14 items-center justify-center p-1 sm:p-2 text-xs sm:text-sm md:text-base font-medium">
                <span className="hidden lg:block">Monday</span>
                <span className="block lg:hidden">Mon</span>
              </th>
              <th className="flex h-12 sm:h-14 items-center justify-center p-1 sm:p-2 text-xs sm:text-sm md:text-base font-medium">
                <span className="hidden lg:block">Tuesday</span>
                <span className="block lg:hidden">Tue</span>
              </th>
              <th className="flex h-12 sm:h-14 items-center justify-center p-1 sm:p-2 text-xs sm:text-sm md:text-base font-medium">
                <span className="hidden lg:block">Wednesday</span>
                <span className="block lg:hidden">Wed</span>
              </th>
              <th className="flex h-12 sm:h-14 items-center justify-center p-1 sm:p-2 text-xs sm:text-sm md:text-base font-medium">
                <span className="hidden lg:block">Thursday</span>
                <span className="block lg:hidden">Thur</span>
              </th>
              <th className="flex h-12 sm:h-14 items-center justify-center p-1 sm:p-2 text-xs sm:text-sm md:text-base font-medium">
                <span className="hidden lg:block">Friday</span>
                <span className="block lg:hidden">Fri</span>
              </th>
              <th className="flex h-12 sm:h-14 items-center justify-center rounded-tr-lg p-1 sm:p-2 text-xs sm:text-sm md:text-base font-medium">
                <span className="hidden lg:block">Saturday</span>
                <span className="block lg:hidden">Sat</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex} className="grid grid-cols-7">
                {week.map((day, dayIndex) => (
                  <td
                    key={day ? day.getTime() : `empty-${weekIndex}-${dayIndex}`}
                    className={`relative h-20 sm:h-24 md:h-28 lg:h-32 cursor-pointer border border-gray-200 p-1 sm:p-2 md:p-3 transition duration-300 hover:bg-gray-100
                      ${weekIndex === weeks.length - 1 && dayIndex === 0 ? 'rounded-bl-lg' : ''}
                      ${weekIndex === weeks.length - 1 && dayIndex === 6 ? 'rounded-br-lg' : ''}
                      ${day && day.toDateString() === today.toDateString() ? 'bg-[#e0e7ff]' : ''}`}
                  >
                    {day && (
                      <>
                        <span className="font-medium text-xs sm:text-sm md:text-base">{day.getDate()}</span>
                        <div className="h-16 sm:h-20 md:h-24 lg:h-28 w-full flex-grow cursor-pointer py-0.5 sm:py-1">
                          {getOrdersForDate(day).length > 0 && (
                            <div className="flex flex-col">
                              {/* Show only the first order */}
                              <div
                                className="flex flex-col rounded-r-md border-l-[3px] border-[#5750f1] bg-gray-100 px-2 sm:px-3 py-1 text-left"
                                onClick={() => handelViewOrder(getOrdersForDate(day)[0].id)}
                              >
                                <span className="font-medium text-xs sm:text-sm">Order {getOrdersForDate(day)[0].orderNumber}</span>
                                <span className="text-xs">Due: {new Date(getOrdersForDate(day)[0].dueDate).toLocaleDateString()}</span>
                              </div>
                              {/* Show "View More Orders" link if there are multiple orders */}
                              {getOrdersForDate(day).length > 1 && (
                                <button
                                  className="text-xs text-[#5750f1] hover:underline mt-0.5 sm:mt-1 cursor-pointer"
                                  onClick={() => openModal(day)}
                                >
                                  View More Orders
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for displaying all orders */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 w-full max-w-[90vw] sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">
              Orders for {selectedDateOrders[0] && new Date(selectedDateOrders[0].dueDate).toLocaleDateString()}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {selectedDateOrders.map(order => (
                <div
                  key={order.id}
                  className="flex flex-col rounded-r-md border-l-[3px] border-[#5750f1] bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 cursor-pointer"
                  onClick={() => handelViewOrder(order.id)}
                >
                  <span className="font-medium text-xs sm:text-sm">Order {order.orderNumber}</span>
                  <span className="text-xs">Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            <button
              className="mt-3 sm:mt-4 py-2 sm:py-2.5 px-6 sm:px-8 md:px-10 bg-[#5750f1] rounded-full text-xs sm:text-sm text-white cursor-pointer hover:bg-blue-700"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;