import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <span style={{ color: '#3b82f6' }}>📷</span>;
    case 'pdf':
      return <span style={{ color: '#ef4444' }}>📄</span>;
    case 'ai':
      return <span style={{ color: '#a855f7' }}>🎨</span>;
    case 'zip':
      return <span style={{ color: '#f97316' }}>📦</span>;
    default:
      return <span style={{ color: '#6b7280' }}>📄</span>;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function Files() {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch files from API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('https://printmanager-api.onrender.com/api/orderFiles/');
        if (!response.ok) throw new Error('Failed to fetch files');
        const data = await response.json();
        // Filter out files where orderId is null
        const validFiles = data.filter((file) => file.orderId !== null);
        setFiles(validFiles);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchFiles();
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

  // Handle menu open and position
  const handleMenuClick = (fileId, event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const newPosition = {
      top: rect.bottom + window.scrollY,
      right: window.innerWidth - rect.right + window.scrollX,
    };
    setMenuPosition(newPosition);
    setMenuOpen(menuOpen === fileId ? null : fileId);
  };

  // Handle View Order navigation
  const handleViewOrder = (orderId) => {
    router.push(`/dashboard/order/view/${orderId}`);
    setMenuOpen(null);
  };

  const DropdownMenu = ({ fileId, filePath, orderId }) => {
    if (menuOpen !== fileId) return null;
    return createPortal(
      <div
        className="absolute bg-white border border-[#e5e7eb] rounded-lg z-50 min-w-[150px] overflow-hidden dropdown-menu"
        style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
      >
        <a
          href={`https://printmanager-api.onrender.com${filePath}`}
          download
          className="block w-full text-left px-4 py-2 text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
          onClick={() => setMenuOpen(null)}
        >
          Download
        </a>
        <button
          onClick={() => handleViewOrder(orderId)}
          className="block w-full text-left px-4 py-2 text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
        >
          View Order
        </button>
      </div>,
      document.getElementById('dropdown-portal') || document.body
    );
  };

  // Filter files based on search and type
  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const extension = file.fileName.split('.').pop().toLowerCase();
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'image' && ['jpg', 'jpeg', 'png'].includes(extension)) ||
      (filterType === 'document' && extension === 'pdf') ||
      (filterType === 'other' && !['jpg', 'jpeg', 'png', 'pdf'].includes(extension));
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const pendingFiles = files.filter((f) => f.status === 'Pending').length;
  const imageFiles = files.filter((f) => ['jpg', 'jpeg', 'png'].includes(f.fileName.split('.').pop().toLowerCase())).length;
  const totalStorage = files.reduce((sum, file) => sum + (file.size || 0), 0) / 1000000; // Convert to MB

  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="flex justify-center items-center py-10">
        <svg
          className="animate-spin h-8 w-8 text-[#5750f1]"
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
  </div>;
  if (error) return <div className="text-center text-red-600 p-4">Error: {error}</div>;

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-[#e5e7eb]">
          <h3 className="text-sm font-medium text-[#111928] mb-2 sm:mb-3">Total Files</h3>
          <div className="text-xl sm:text-2xl font-bold text-[#111928]">{files.length}</div>
          <p className="text-xs text-[#9ca3af] mt-1">Across all orders</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-[#e5e7eb]">
          <h3 className="text-sm font-medium text-[#111928] mb-2 sm:mb-3">Pending Approval</h3>
          <div className="text-xl sm:text-2xl font-bold text-[#111928]">{pendingFiles}</div>
          <p className="text-xs text-[#9ca3af] mt-1">Needs review</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-[#e5e7eb]">
          <h3 className="text-sm font-medium text-[#111928] mb-2 sm:mb-3">Images</h3>
          <div className="text-xl sm:text-2xl font-bold text-[#111928]">{imageFiles}</div>
          <p className="text-xs text-[#9ca3af] mt-1">Design files</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-[#e5e7eb]">
          <h3 className="text-sm font-medium text-[#111928] mb-2 sm:mb-3">Storage Used</h3>
          <div className="text-xl sm:text-2xl font-bold text-[#111928]">{totalStorage.toFixed(1)} MB</div>
          <p className="text-xs text-[#9ca3af] mt-1">Total file size</p>
        </div>
      </div>

      {/* Search and Filter Options */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-[#e5e7eb] mb-6 sm:mb-8">
        <div className="mb-4">
          <h2 className="font-medium text-gray-800 text-lg sm:text-xl md:text-2xl">File Library</h2>
          <p className="text-sm sm:text-base text-[#9ca3af]">Search and filter through all uploaded files</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <input
            type="text"
            placeholder="Search by name, order, customer, or uploaded by"
            className="w-full px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-1/3 px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-sm sm:text-base text-[#111928]"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="other">Other Files</option>
          </select>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-[#e5e7eb]">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-none bg-[#F7F9FC] py-3 sm:py-4 text-[#111928]">
                <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[80px] sm:min-w-[100px]">File ID</th>
                <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500">Name</th>
                <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500">Order</th>
                <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500">Customer</th>
                <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500">Uploaded By</th>
                <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500">Upload Date</th>
                <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500">Status</th>
                <th className="h-12 px-2 sm:px-4 text-right align-middle font-medium text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className="border-b border-[#eee] transition-colors hover:bg-neutral-100/50"
                >
                  <td className="p-2 sm:p-4 align-middle min-w-[80px] sm:min-w-[100px]">
                    <p className="text-[#111928] text-sm sm:text-base">{file.id}</p>
                  </td>
                  <td className="p-2 sm:p-4 align-middle">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.fileName)}
                      <p className="text-[#111928] text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">{file.fileName}</p>
                    </div>
                  </td>
                  <td className="p-2 sm:p-4 align-middle">
                    <p className="text-[#111928] text-sm sm:text-base">{file.order.orderNumber}</p>
                  </td>
                  <td className="p-2 sm:p-4 align-middle">
                    <p className="text-[#111928] text-sm sm:text-base">{`${file.order.customer.firstName} ${file.order.customer.lastName}`}</p>
                  </td>
                  <td className="p-2 sm:p-4 align-middle">
                    <p className="text-[#111928] text-sm sm:text-base">{file.uploadedBy}</p>
                  </td>
                  <td className="p-2 sm:p-4 align-middle">
                    <p className="text-[#111928] text-sm sm:text-base">{new Date(file.uploadedAt).toLocaleString()}</p>
                  </td>
                  <td className="p-2 sm:p-4 align-middle">
                    <div className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg ${getStatusColor(file.status)}`}>{file.status}</div>
                  </td>
                  <td className="p-2 sm:p-4 align-middle">
                    <div className="relative flex justify-end">
                      <button
                        className="dropdown-button hover:text-[#2563eb] transition"
                        onClick={(e) => handleMenuClick(file.id, e)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <circle cx="10" cy="4" r="2" />
                          <circle cx="10" cy="10" r="2" />
                          <circle cx="10" cy="16" r="2" />
                        </svg>
                      </button>
                      <DropdownMenu fileId={file.id} filePath={file.filePath} orderId={file.orderId} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Files;