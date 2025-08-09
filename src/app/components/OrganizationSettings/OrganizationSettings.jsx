import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrganizationSettings = () => {
  const [settings, setSettings] = useState({
    id: null,
    name: '',
    address: '',
    email: '',
    contactNumber: '',
    logo: '',
  });
  const [editedData, setEditedData] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newLogo, setNewLogo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch organization settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsFetching(true);
        const response = await axios.get('https://printmanager-api.onrender.com/api/organization-settings');
        setSettings(response.data);
        setEditedData(response.data);
      } catch (error) {
        toast.error('Failed to fetch organization settings');
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, []);

  // Handle form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle logo file change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setNewLogo(file);
    } else {
      toast.error('Please select a valid image file (jpg, jpeg, png)');
    }
  };

  // Handle form submission
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', editedData.name || '');
    formData.append('address', editedData.address || '');
    formData.append('email', editedData.email || '');
    formData.append('contactNumber', editedData.contactNumber || '');
    if (newLogo) {
      formData.append('logo', newLogo);
    }

    try {
      const response = await axios.put(
        'https://printmanager-api.onrender.com/api/organization-settings',
        formData,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        }
      );
      setSettings(response.data);
      setEditedData(response.data);
      setNewLogo(null);
      setUploadProgress(0);
      setIsEditModalOpen(false);
      toast.success('Settings updated successfully');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = () => {
    setEditedData(settings);
    setNewLogo(null);
    setIsEditModalOpen(true);
  };

  // Render loading state
  if (isFetching) {
    return (
      <div>
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full border border-[#e5e7eb] shadow-sm flex justify-center items-center">
          <svg
            className="h-6 sm:h-8 w-6 sm:w-8 animate-spin text-[#5750f1]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full border border-[#e5e7eb] shadow-sm">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Organization Settings</h3>
          <button
            onClick={openEditModal}
            className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 sm:h-5 w-4 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { label: 'Name', value: settings.name || 'N/A' },
            { label: 'Address', value: settings.address || 'N/A' },
            { label: 'Email', value: settings.email || 'N/A' },
            { label: 'Contact Number', value: settings.contactNumber || 'N/A' },
          ].map((field, index) => (
            <div
              key={index}
              className="border border-[#e5e7eb] px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-1 sm:gap-2"
            >
              <h5 className="font-bold text-[#111928] text-xs sm:text-sm">{field.label}</h5>
              <h5 className="text-[#6b7280] text-xs sm:text-sm break-words">{field.value}</h5>
            </div>
          ))}
          <div className="border border-[#e5e7eb] px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-1 sm:gap-2">
            <h5 className="font-bold text-[#111928] text-xs sm:text-sm">Logo</h5>
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Organization Logo"
                className="max-h-24 sm:max-h-32 w-auto object-contain"
              />
            ) : (
              <p className="text-[#6b7280] text-xs sm:text-sm">No logo uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Settings Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50 px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[90vw] sm:max-w-lg">
            <div className="flex justify-between items-center border-b border-gray-200 p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Edit Organization Settings</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 sm:h-6 w-5 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveChanges} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">
                    Organization Information
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editedData.name || ''}
                        onChange={handleEditInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={editedData.address || ''}
                        onChange={handleEditInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editedData.email || ''}
                        onChange={handleEditInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={editedData.contactNumber || ''}
                        onChange={handleEditInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1] text-xs sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Logo</h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Upload New Logo
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleLogoChange}
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-3 sm:file:mr-4 file:py-2 sm:file:py-3 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                    {newLogo && (
                      <div className="mt-2">
                        <p className="text-xs sm:text-sm text-gray-500">Preview:</p>
                        <img
                          src={URL.createObjectURL(newLogo)}
                          alt="Logo Preview"
                          className="max-h-24 sm:max-h-32 w-auto object-contain mt-1"
                        />
                      </div>
                    )}
                    {editedData.logo && !newLogo && (
                      <div className="mt-2">
                        <p className="text-xs sm:text-sm text-gray-500">Current Logo:</p>
                        <img
                          src={editedData.logo}
                          alt="Current Logo"
                          className="max-h-24 sm:max-h-32 w-auto object-contain mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 sm:space-x-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2 sm:py-3 px-3 sm:px-4 bg-gray-200 text-[#111928] rounded-lg text-xs sm:text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-2 sm:py-3 px-3 sm:px-4 bg-[#5750f1] text-white rounded-lg text-xs sm:text-sm font-medium transition flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {loading && (
                    <svg
                      className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {loading ? `Saving${uploadProgress > 0 ? ` (${uploadProgress}%)` : '...'}` : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSettings;
