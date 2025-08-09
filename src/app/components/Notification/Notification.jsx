"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getNotificationIcon = (type) => {
  switch (type) {
    case "warning": return "⏰";
    case "success": return "✅";
    case "info": return "🔔";
    default: return "🔔";
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case "warning": return "border-orange-200 bg-orange-50";
    case "success": return "border-green-200 bg-green-50";
    case "info": return "border-blue-200 bg-blue-50";
    default: return "border-gray-200 bg-gray-50";
  }
};

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const router = useRouter();

  const fetchNotifications = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch('https://printmanager-api.onrender.com/api/notifications/', {
              headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      const data = await response.json();
      
      const processedNotifications = data.map(notification => {
        const orderMatch = notification.message.match(/ORD-\d+/);
        return {
          ...notification,
          orderNumber: orderMatch ? orderMatch[0] : null,
          message: orderMatch ? notification.message.replace(/by\s+\w+\s*\./, '') : notification.message
        };
      });
      
      setNotifications(processedNotifications);
    } catch (error) {
      toast.error("Failed to fetch notifications");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`https://printmanager-api.onrender.com/api/notifications/${id}/read`, {
        method: 'PUT',
              headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      setNotifications(notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ));
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        await fetch(`https://printmanager-api.onrender.com/api/notifications/${notification.id}/read`, {
          method: 'PUT',
                headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        });
      }
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleViewOrder = (orderId) => {
    router.push(`/dashboard/order/view/${orderId}`);
  };

  const loadMoreNotifications = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setLoadingMore(false);
    }, 1000);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return false;
  });

  const visibleNotifications = filteredNotifications.slice(0, visibleCount);

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg border border-[#e5e7eb]">
          <div className="mb-2">
            <h3 className="text-sm font-medium text-[#111928]">Total Notifications</h3>
          </div>
          <div className="text-lg sm:text-xl font-medium text-[#111928]">{notifications.length}</div>
          <p className="text-xs text-[#9ca3af]">All notifications</p>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg border border-[#e5e7eb]">
          <div className="mb-2">
            <h3 className="text-sm font-medium text-[#111928]">Unread</h3>
          </div>
          <div className="text-lg sm:text-xl font-medium text-[#111928]">{unreadCount}</div>
          <p className="text-xs text-[#9ca3af]">Need attention</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 bg-white p-4 sm:p-6 lg:p-8 rounded-lg w-full border border-[#e5e7eb]">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm sm:text-base ${filter === "all" ? "bg-[#5750f1] text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-700 hover:text-white transition w-full sm:w-auto`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-2 rounded-lg text-sm sm:text-base ${filter === "unread" ? "bg-[#5750f1] text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-700 hover:text-white transition w-full sm:w-auto`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={markAllAsRead}
              className="px-3 py-2 rounded-lg text-sm sm:text-base bg-gray-200 text-gray-700 hover:bg-blue-700 hover:text-white transition w-full sm:w-auto"
            >
              Mark All Read
            </button>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg w-full border border-[#e5e7eb]">
          <div className="mb-2">
            <h3 className="text-base sm:text-lg font-medium text-[#111928]">Notifications</h3>
            <p className="text-xs sm:text-sm text-[#9ca3af]">
              {filter === "all" && "All notifications"}
              {filter === "unread" && "Unread notifications"}
            </p>
          </div>
          <div className="space-y-4">
            {loading ? (
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
            ) : visibleNotifications.length === 0 ? (
              <div className="text-center py-4">
                <span className="text-xl sm:text-2xl">🔔</span>
                <p className="text-xs sm:text-sm text-[#9ca3af]">No notifications found</p>
              </div>
            ) : (
              <>
                {visibleNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.isRead ? "border-l-4" : "opacity-75"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div className="flex items-start space-x-3 flex-1 mb-3 sm:mb-0">
                        <span className="text-base sm:text-lg">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm sm:text-base text-[#111928]">{notification.title}</h4>
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                          <p className="text-xs sm:text-sm text-[#9a3af] mb-2">{notification.message}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[#9ca3af]">
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                            {notification.orderId && (
                              <span className="border border-[#e5e7eb] px-2 py-1 rounded-lg">Order: {notification.orderNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="px-2 py-1 bg-[#5750f1] text-white rounded-lg text-xs hover:bg-blue-700 transition w-full sm:w-auto"
                          >
                            Mark Read
                          </button>
                        )}
                        {notification.orderId && (
                          <button
                            onClick={() => handleViewOrder(notification.orderId)}
                            className="px-2 py-1 border border-[#e5e7eb] rounded-lg text-xs text-[#2563eb] hover:text-blue-700 w-full sm:w-auto"
                          >
                            View Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {visibleCount < filteredNotifications.length && (
                  <div className="text-center mt-4">
                    <button
                      onClick={loadMoreNotifications}
                      disabled={loadingMore}
                      className="px-4 py-2 bg-[#5750f1] text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
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
                          Loading...
                        </div>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}