import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditUserPopup = ({ isOpen, onClose, user, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: user?.isAdmin ? 'admin' : user?.isManager ? 'manager' : 'member',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.isAdmin ? 'admin' : user.isManager ? 'manager' : 'member',
      });
      setError(null);
    }
  }, [user]);

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
      const updatedUser = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        isAdmin: formData.role === 'admin',
        isManager: formData.role === 'manager',
        isMember: formData.role === 'member',
      };
      const response = await fetch(`https://printmanager-api.onrender.com/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update user');
        throw new Error(errorData.message || 'Failed to update user');
      }
      const savedUser = await response.json();
      onSave({ id: user.id, ...savedUser });
      toast.success('User updated successfully');
      onClose();
    } catch (error) {
      toast.error(`Error updating user: ${error.message}`);
      console.error('Error updating user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg w-full max-w-[90vw] sm:max-w-[500px] max-h-[80vh] overflow-y-auto shadow-xl transform transition-all duration-300 ease-in-out animate-popup">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">Edit User</h2>
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928]">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928]">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928]">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928]">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#111928]">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
              required
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 sm:py-2.5 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`py-2 sm:py-2.5 px-4 sm:px-6 bg-[#5750f1] text-white rounded-lg font-medium transition flex items-center justify-center text-xs sm:text-sm ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <svg className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteUserPopup = ({ isOpen, onClose, userId, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://printmanager-api.onrender.com/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete user');
        throw new Error(errorData.message || 'Failed to delete user');
      }
      toast.success('User deleted successfully');
      onDelete(userId);
      onClose();
    } catch (error) {
      toast.error(`Error deleting user: ${error.message}`);
      console.error('Error deleting user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg w-full max-w-[90vw] sm:max-w-[400px] shadow-xl transform transition-all duration-300 ease-in-out animate-popup">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">Confirm Delete</h2>
        <p className="text-xs sm:text-sm text-[#111928] mb-3 sm:mb-4">Are you sure you want to delete this user?</p>
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="py-2 sm:py-2.5 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg hover:bg-gray-300 cursor-pointer text-xs sm:text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`py-2 sm:py-2.5 px-4 sm:px-6 bg-[#ef4444] text-white rounded-lg flex items-center justify-center text-xs sm:text-sm ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
          >
            {loading ? (
              <svg className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleStatusPopup = ({ isOpen, onClose, userId, currentStatus, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://printmanager-api.onrender.com/api/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to toggle user status');
        throw new Error(errorData.message || 'Failed to toggle user status');
      }
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      onToggle(userId, !currentStatus);
      onClose();
    } catch (error) {
      toast.error(`Error toggling user status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg w-full max-w-[90vw] sm:max-w-[400px] shadow-xl transform transition-all duration-300 ease-in-out animate-popup">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-3 sm:mb-4">Confirm Status Change</h2>
        <p className="text-xs sm:text-sm text-[#111928] mb-3 sm:mb-4">
          Are you sure you want to {currentStatus ? 'deactivate' : 'activate'} this user?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="py-2 sm:py-2.5 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg hover:bg-gray-300 cursor-pointer text-xs sm:text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`py-2 sm:py-2.5 px-4 sm:px-6 bg-[#5750f1] text-white rounded-lg flex items-center justify-center text-xs sm:text-sm ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <svg className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? 'Processing...' : `${currentStatus ? 'Deactivate' : 'Activate'} User`}
          </button>
        </div>
      </div>
    </div>
  );
};

const DropdownMenu = ({ userId, menuPosition, menuOpen, onEdit, onDelete, onToggle, currentStatus }) => {
  if (menuOpen !== userId) return null;
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
          onEdit(userId);
        }}
        className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        Edit User
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(userId);
        }}
        className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        Delete User
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(userId, currentStatus);
        }}
        className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        {currentStatus ? 'Deactivate' : 'Activate'} User
      </button>
    </div>,
    document.getElementById('dropdown-portal') || document.body
  );
};

const RoleCard = ({ onUserUpdated }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState({ isOpen: false, user: null });
  const [deleteUser, setDeleteUser] = useState({ isOpen: false, userId: null });
  const [toggleStatus, setToggleStatus] = useState({ isOpen: false, userId: null, currentStatus: false });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://printmanager-api.onrender.com/api/users', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [onUserUpdated]);

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

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && user.isAdmin) ||
      (roleFilter === 'manager' && user.isManager) ||
      (roleFilter === 'member' && user.isMember);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Action handlers
  const handleEditUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setEditUser({ isOpen: true, user });
      setMenuOpen(null);
    } else {
      console.error('User not found for userId:', userId);
    }
  };

  const handleDeleteUser = (userId) => {
    setDeleteUser({ isOpen: true, userId });
    setMenuOpen(null);
  };

  const handleToggleActive = (userId, currentStatus) => {
    setToggleStatus({ isOpen: true, userId, currentStatus });
    setMenuOpen(null);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
    if (typeof onUserUpdated === 'function') {
      onUserUpdated();
    } else {
      console.warn('onUserUpdated is not a function, skipping call');
    }
    setMenuOpen(null);
  };

  const handleDeleteUserConfirmed = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (typeof onUserUpdated === 'function') {
      onUserUpdated();
    } else {
      console.warn('onUserUpdated is not a function, skipping call');
    }
    setMenuOpen(null);
  };

  const handleToggleStatusConfirmed = (userId, newStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u))
    );
    if (typeof onUserUpdated === 'function') {
      onUserUpdated();
    } else {
      console.warn('onUserUpdated is not a function, skipping call');
    }
    setMenuOpen(null);
  };

  // Handle menu open and position
  const handleMenuClick = (userId, event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const newPosition = {
      top: rect.bottom + window.scrollY,
      right: window.innerWidth - rect.right + window.scrollX,
    };
    setMenuPosition(newPosition);
    setMenuOpen(menuOpen === userId ? null : userId);
  };

  return (
    <div>
      <div className="rounded-lg bg-white p-4 sm:p-5 md:p-6 border border-[#e5e7eb] shadow-sm">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#111928] mb-1 sm:mb-2">User Directory</h2>
        <p className="text-xs sm:text-sm text-[#9ca3af] mb-3 sm:mb-4">Search and filter user accounts</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="Search by username or email"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="w-full sm:w-auto sm:flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
          </select>
          <select
            className="w-full sm:w-auto sm:flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Deactive</option>
          </select>
        </div>
      </div>
      <div className="mt-4 sm:mt-6 rounded-lg bg-white p-4 sm:p-5 md:p-6 border border-[#e5e7eb] shadow-sm">
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
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-[#9ca3af] text-sm sm:text-base">
              No Data Found
            </div>
          ) : (
            <table className="w-full caption-bottom text-xs sm:text-sm table-auto">
              <thead>
                <tr className="border-none bg-[#F7F9FC] py-3 sm:py-4 text-[#111928]">
                  <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500 min-w-[80px] sm:min-w-[100px]">Username</th>
                  <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500 hidden sm:table-cell">Email</th>
                  <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500 hidden md:table-cell">First Name</th>
                  <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500 hidden md:table-cell">Last Name</th>
                  <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500">Role</th>
                  <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-neutral-500">Status</th>
                  <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#eee] transition-colors hover:bg-neutral-100/50"
                  >
                    <td className="p-2 sm:p-4 align-middle min-w-[80px] sm:min-w-[100px]">
                      <p className="text-[#111928] text-xs sm:text-sm">{user.username || 'N/A'}</p>
                    </td>
                    <td className="p-2 sm:p-4 align-middle hidden sm:table-cell">
                      <p className="text-[#111928] text-xs sm:text-sm">{user.email || 'N/A'}</p>
                    </td>
                    <td className="p-2 sm:p-4 align-middle hidden md:table-cell">
                      <p className="text-[#111928] text-xs sm:text-sm">{user.firstName || 'N/A'}</p>
                    </td>
                    <td className="p-2 sm:p-4 align-middle hidden md:table-cell">
                      <p className="text-[#111928] text-xs sm:text-sm">{user.lastName || 'N/A'}</p>
                    </td>
                    <td className="p-2 sm:p-4 align-middle">
                      <p className="text-[#111928] text-xs sm:text-sm">
                        {user.isAdmin ? 'Admin' : user.isManager ? 'Manager' : 'Member'}
                      </p>
                    </td>
                    <td className="p-2 sm:p-4 align-middle">
                      <div
                        className={`max-w-fit rounded-full px-2 sm:px-3.5 py-0.5 sm:py-1 text-xs sm:text-sm font-medium ${
                          user.isActive
                            ? 'bg-[#219653]/[0.08] text-[#219653]'
                            : 'bg-[#D34053]/[0.08] text-[#D34053]'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Deactive'}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 align-middle">
                      <div className="relative flex justify-end">
                        <button
                          className="dropdown-button hover:text-[#2563eb] transition"
                          onClick={(e) => handleMenuClick(user.id, e)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          >
                            <circle cx="10" cy="4" r="2" />
                            <circle cx="10" cy="10" r="2" />
                            <circle cx="10" cy="16" r="2" />
                          </svg>
                        </button>
                        <DropdownMenu
                          userId={user.id}
                          menuPosition={menuPosition}
                          menuOpen={menuOpen}
                          onEdit={handleEditUser}
                          onDelete={handleDeleteUser}
                          onToggle={handleToggleActive}
                          currentStatus={user.isActive}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <EditUserPopup
        isOpen={editUser.isOpen}
        onClose={() => {
          setEditUser({ isOpen: false, user: null });
        }}
        user={editUser.user}
        onSave={handleSaveUser}
      />
      <DeleteUserPopup
        isOpen={deleteUser.isOpen}
        onClose={() => {
          setDeleteUser({ isOpen: false, userId: null });
        }}
        userId={deleteUser.userId}
        onDelete={handleDeleteUserConfirmed}
      />
      <ToggleStatusPopup
        isOpen={toggleStatus.isOpen}
        onClose={() => {
          setToggleStatus({ isOpen: false, userId: null, currentStatus: false });
        }}
        userId={toggleStatus.userId}
        currentStatus={toggleStatus.currentStatus}
        onToggle={handleToggleStatusConfirmed}
      />
    </div>
  );
};

export default RoleCard;