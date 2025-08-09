"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateStagePopup = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    state: '',
    name: '',
    position: 0,
    color: '#000000',
    days: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.state.trim() || !formData.name.trim() || !formData.position || !formData.color.trim() || !formData.days) {
      setError('All fields are required');
      return;
    }

    const payload = {
      ...formData,
      position: parseInt(formData.position, 0),
      days: parseInt(formData.days, 10),
      createdBy: sessionStorage.getItem('username') || 'Unknown',
    };

    if (isNaN(payload.days)) {
      setError('Days must be a valid number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://printmanager-api.onrender.com/api/stages', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create stage');
      }
      const newStage = await response.json();
      onSave(newStage);
      onClose();
      toast.success('Stage created successfully');
    } catch (error) {
      console.error('Error creating stage:', error);
      toast.error(error.message || 'Failed to create stage');
      setError(error.message || 'Failed to create stage');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-[90%] sm:max-w-[600px] shadow-xl transform transition-all duration-300 ease-in-out">
        <h2 className="text-xl font-bold text-[#111928] mb-4">Create Stage</h2>
        {error && <div className="mb-4 p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111928]">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111928]">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111928]">Position</label>
            <input
              name="position"
              type="number"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111928]">Color (e.g., #FF5733)</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111928]">Days</label>
            <input
              type="number"
              name="days"
              value={formData.days}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`py-2 px-4 sm:px-6 bg-[#5750f1] text-white rounded-lg flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
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
              {loading ? 'Creating Stage...' : 'Create Stage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditStagePopup = ({ isOpen, onClose, stage, onSave }) => {
  const [formData, setFormData] = useState({
    state: stage?.state || '',
    name: stage?.name || '',
    position: stage?.position || 0,
    color: stage?.color || '#000000',
    days: stage?.days || 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stage) {
      setFormData({
        state: stage.state || '',
        name: stage.name || '',
        position: stage.position || 0,
        color: stage.color || '#000000',
        days: stage.days || 1,
      });
      setError('');
    }
  }, [stage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.state.trim() || !formData.name.trim() || !formData.position || !formData.color.trim() || !formData.days) {
      setError('All fields are required');
      return;
    }

    const payload = {
      ...formData,
      position: parseInt(formData.position, 0),
      days: parseInt(formData.days, 10),
      createdBy: sessionStorage.getItem('username') || 'Unknown',
    };

    if (isNaN(payload.days)) {
      setError('Days must be a valid number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://printmanager-api.onrender.com/api/stages/${stage.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update stage');
      const updatedStage = await response.json();
      onSave(updatedStage);
      onClose();
      toast.success('Stage updated successfully');
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
      setError('Failed to update stage');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-[90%] sm:max-w-[600px] shadow-xl transform transition-all duration-300 ease-in-out">
        <h2 className="text-xl font-bold text-[#111928] mb-4">Edit Stage</h2>
        {error && <div className="mb-4 p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111928]">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111928]">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111928]">Position</label>
            <input
              type="number"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111928]">Color (e.g., #FF5733)</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111928]">Days</label>
            <input
              type="number"
              name="days"
              value={formData.days}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`py-2 px-4 sm:px-6 bg-[#5750f1] text-white rounded-lg flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteStagePopup = ({ isOpen, onClose, stageId, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://printmanager-api.onrender.com/api/stages/${stageId}`, {
        method: 'DELETE',
              headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete stage');
      onDelete(stageId);
      onClose();
      toast.success('Stage deleted successfully');
    } catch (error) {
      console.error('Error deleting stage:', error);
      toast.error('Failed to delete stage');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-[90%] sm:max-w-[600px] shadow-xl transform transition-all duration-300 ease-in-out">
        <h2 className="text-xl font-bold text-[#111928] mb-4">Confirm Delete</h2>
        <p className="text-sm text-[#111928] mb-4">Are you sure you want to delete this stage?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="py-2 px-4 sm:px-6 bg-gray-200 text-[#111928] rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`py-2 px-4 sm:px-6 bg-[#ef4444] text-white rounded-lg flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
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
            {loading ? 'Deleting...' : 'Delete Stage'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DropdownMenu = ({ stageId, menuPosition, menuOpen, onEdit, onDelete }) => {
  if (menuOpen !== stageId) return null;
  return createPortal(
    <div
      className="absolute bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50 min-w-[150px] overflow-hidden dropdown-menu"
      style={{
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right}px`,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(stageId);
        }}
        className="block w-full text-left px-4 py-2 text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        Edit Stage
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(stageId);
        }}
        className="block w-full text-left px-4 py-2 text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        Delete Stage
      </button>
    </div>,
    document.getElementById('dropdown-portal') || document.body
  );
};

export default function Stage() {
  const [stages, setStages] = useState([]);
  const [createPopupOpen, setCreatePopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://printmanager-api.onrender.com/api/stages', {
                headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        });
        if (!response.ok) throw new Error('Failed to fetch stages');
        const data = await response.json();
        setStages(Array.isArray(data) ? data : data.stages || []);
      } catch (error) {
        console.error('Error fetching stages:', error);
        setStages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStages();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-button')) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCreateStage = (newStage) => {
    setStages([...stages, newStage]);
  };

  const handleEditStage = (updatedStage) => {
    setStages(stages.map((s) => (s.id === updatedStage.id ? updatedStage : s)));
  };

  const handleDeleteStage = (stageId) => {
    setStages(stages.filter((s) => s.id !== stageId));
  };

  const handleMenuClick = (stageId, event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const newPosition = {
      top: rect.bottom + window.scrollY,
      right: window.innerWidth - rect.right + window.scrollX,
    };
    setMenuPosition(newPosition);
    setMenuOpen(menuOpen === stageId ? null : stageId);
  };

  // Close DropdownMenu when any popup opens
  useEffect(() => {
    if (createPopupOpen || editPopupOpen || deletePopupOpen) {
      setMenuOpen(null);
    }
  }, [createPopupOpen, editPopupOpen, deletePopupOpen]);

      const [isAllowed, setIsAllowed] = useState(false);
          
      useEffect(() => {
        const email = sessionStorage.getItem('email');
    
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
      }, []);

  return (
    <div className="bg-white p-4 sm:p-8 rounded-lg w-full border border-[#e5e7eb]">
      {isAllowed ? "" : (
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setCreatePopupOpen(true)}
          className="py-2 px-4 sm:px-6 bg-[#5750f1] text-white rounded-lg hover:bg-blue-700"
        >
          Create Stage
        </button>
      </div>
      )}
      {isLoading ? (
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
      ) : stages.length === 0 ? (
        <div className="text-center py-10 text-[#9ca3af] text-lg">Data Not Found</div>
      ) : (
        <div>
          <h2 className="font-medium text-gray-800 text-xl sm:text-2xl mb-4">Stages</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stages.map((stage) => (
              <div key={stage.id} className="bg-white p-4 sm:p-6 rounded-lg border border-[#e5e7eb] relative">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="text-base sm:text-lg font-semibold text-[#111928]">{stage.state}</h3>
                </div>
                <div className="space-y-2 mt-2 text-sm text-[#9ca3af]">
                  <div>Name: {stage.name}</div>
                  <div>Position: {stage.position}</div>
                  <div>Days: {stage.days}</div>
                  <div>Created By: {stage.createdBy}</div>
                </div>
                { isAllowed ? "" : (
                <div className="absolute top-4 right-4">
                  <button
                    className="dropdown-button hover:text-[#2563eb] transition"
                    onClick={(e) => handleMenuClick(stage.id, e)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <circle cx="10" cy="4" r="2" />
                      <circle cx="10" cy="10" r="2" />
                      <circle cx="10" cy="16" r="2" />
                    </svg>
                  </button>
                  <DropdownMenu
                    stageId={stage.id}
                    menuPosition={menuPosition}
                    menuOpen={menuOpen}
                    onEdit={() => {
                      setSelectedStage(stage);
                      setEditPopupOpen(true);
                    }}
                    onDelete={() => {
                      setSelectedStage(stage);
                      setDeletePopupOpen(true);
                    }}
                  />
                </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <CreateStagePopup
        isOpen={createPopupOpen}
        onClose={() => setCreatePopupOpen(false)}
        onSave={handleCreateStage}
      />
      <EditStagePopup
        isOpen={editPopupOpen}
        onClose={() => setEditPopupOpen(false)}
        stage={selectedStage}
        onSave={handleEditStage}
      />
      <DeleteStagePopup
        isOpen={deletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        stageId={selectedStage?.id}
        onDelete={handleDeleteStage}
      />
    </div>
  );
}