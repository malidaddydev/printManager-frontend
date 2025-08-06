"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function CheckIcon({ className }) {
  return (
    <svg
      width="11"
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
    <div className="mb-2">
      <label
        htmlFor={id}
        className="flex cursor-pointer select-none items-center text-sm text-[#111928]"
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
            className="mr-2 flex size-5 items-center justify-center rounded border border-[#e5e7eb] peer-checked:border-[#5750f1] peer-checked:bg-[#f3f4f6] [&>*]:text-[#5750f1] peer-checked:[&>*]:block"
          >
            <CheckIcon className="hidden text-[#5750f1]" />
          </div>
        </div>
        <span>{label}</span>
      </label>
    </div>
  );
}

const CreateWorkflowPopup = ({ isOpen, onClose, onSave }) => {
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [stages, setStages] = useState([]);
  const [selectedStageIds, setSelectedStageIds] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stagesLoading, setStagesLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStagesLoading(true);
      fetch('https://printmanager-api.onrender.com/api/stages/')
        .then(res => res.json())
        .then(data => {
          setStages(Array.isArray(data) ? data : data.stages || []);
          setStagesLoading(false);
        })
        .catch(() => {
          toast.error('Failed to load stages');
          setStagesLoading(false);
        });
    }
  }, [isOpen]);

  const handleCheckboxChange = (stageId) => {
    setSelectedStageIds(prev =>
      prev.includes(stageId) ? prev.filter(id => id !== stageId) : [...prev, stageId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workflowTitle.trim()) {
      setError('Workflow title is required');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://printmanager-api.onrender.com/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: workflowTitle,
          createdBy: sessionStorage.getItem("username") || 'Unknown',
          stageIds: selectedStageIds,
        }),
      });
      if (!response.ok) throw new Error('Failed to create workflow');
      const newWorkflow = await response.json();
      onSave(newWorkflow);
      onClose();
      toast.success('Workflow created successfully');
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
      setError('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-[90%] sm:max-w-[700px] shadow-xl transform transition-all duration-300 ease-in-out max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold text-[#111928] mb-4">Create Workflow</h2>
        {error && <div className="mb-4 p-3 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111928]">Workflow Title</label>
            <input
              type="text"
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111928] mb-2">Select Stages</label>
            {stagesLoading ? (
              <div className="flex justify-center items-center py-4">
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {stages.length === 0 ? (
                  <div className="text-center text-sm text-[#9ca3af]">No stages available</div>
                ) : (
                  stages.map((stage) => (
                    <div
                      key={stage.id}
                      className="flex items-center gap-2 p-2 border border-[#e5e7eb] rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <CustomCheckbox
                        label={
                          <div>
                            <p className="font-medium text-sm">{stage.name}</p>
                            <p className="text-xs text-gray-500">
                              State: {stage.state} • Team: {stage.team} • Duedays: {stage.days}
                            </p>
                          </div>
                        }
                        checked={selectedStageIds.includes(stage.id)}
                        onChange={() => handleCheckboxChange(stage.id)}
                        name={`stage-${stage.id}`}
                      />
                      <span
                        className="w-4 h-4 rounded-full inline-block"
                        style={{ backgroundColor: stage.color }}
                        title={stage.color}
                      ></span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
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
              {loading ? 'Creating...' : 'Create Workflow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteWorkflowPopup = ({ isOpen, onClose, workflowId, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://printmanager-api.onrender.com/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete workflow');
      onDelete(workflowId);
      onClose();
      toast.success('Workflow deleted successfully');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-[90%] sm:max-w-[600px] shadow-xl transform transition-all duration-300 ease-in-out">
        <h2 className="text-lg sm:text-xl font-bold text-[#111928] mb-4">Confirm Delete</h2>
        <p className="text-sm text-[#111928] mb-4">Are you sure you want to delete this workflow?</p>
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
            {loading ? 'Deleting...' : 'Delete Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DropdownMenu = ({ workflowId, menuPosition, menuOpen, onDelete }) => {
  if (menuOpen !== workflowId) return null;
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
          onDelete(workflowId);
        }}
        className="block w-full text-left px-4 py-2 text-sm text-[#111928] hover:bg-[#f7f9fc] transition"
      >
        Delete Workflow
      </button>
    </div>,
    document.getElementById('dropdown-portal') || document.body
  );
};

export default function Workflow() {
  const [workflows, setWorkflows] = useState([]);
  const [createPopupOpen, setCreatePopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://printmanager-api.onrender.com/api/workflows');
        if (!response.ok) throw new Error('Failed to fetch workflows');
        const data = await response.json();
        setWorkflows(Array.isArray(data) ? data : data.workflows || []);
      } catch (error) {
        console.error('Error fetching workflows:', error);
        setWorkflows([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkflows();
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

  // Close DropdownMenu when any popup opens
  useEffect(() => {
    if (createPopupOpen || deletePopupOpen) {
      setMenuOpen(null);
    }
  }, [createPopupOpen, deletePopupOpen]);

  const handleCreateWorkflow = async (newWorkflow) => {
    try {
      // Fetch the full workflow details including stages
      const response = await fetch(`https://printmanager-api.onrender.com/api/workflows/${newWorkflow.id}`);
      if (!response.ok) throw new Error('Failed to fetch new workflow details');
      const fullWorkflow = await response.json();
      setWorkflows([...workflows, fullWorkflow]);
    } catch (error) {
      console.error('Error fetching new workflow details:', error);
      // Fallback to adding the partial workflow if fetch fails
      setWorkflows([...workflows, newWorkflow]);
      toast.error('Failed to load full workflow details');
    }
  };

  const handleDeleteWorkflow = (workflowId) => {
    setWorkflows(workflows.filter((wf) => wf.id !== workflowId));
  };

  const handleMenuClick = (workflowId, event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const newPosition = {
      top: rect.bottom + window.scrollY,
      right: window.innerWidth - rect.right + window.scrollX,
    };
    setMenuPosition(newPosition);
    setMenuOpen(menuOpen === workflowId ? null : workflowId);
  };

    const [isAllowed, setIsAllowed] = useState(false);
        
    useEffect(() => {
      const email = sessionStorage.getItem('email');
  
      fetch('https://printmanager-api.onrender.com/api/users')
        .then((res) => res.json())
        .then((users) => {
          const user = users.find((u) => u.email === email);
          if (!user || user.isMember === true) {
            setIsAllowed(true);
          } 
        })
    }, []);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full border border-[#e5e7eb]">
      {isAllowed ? "" : (
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setCreatePopupOpen(true)}
          className="py-2 px-4 sm:px-6 bg-[#5750f1] text-white rounded-lg hover:bg-blue-700"
        >
          Create Workflow
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
      ) : workflows.length === 0 ? (
        <div className="text-center py-10 text-[#9ca3af] text-base sm:text-lg">Data Not Found</div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white p-4 sm:p-6 rounded-lg border border-[#e5e7eb] relative">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#111928]">{workflow.title}</h3>
                <span className="text-xs sm:text-sm text-[#111928] border border-[#e5e7eb] rounded-full px-3 sm:px-[18px] py-1 sm:py-[2px]">
                  {workflow.stages ? workflow.stages.length : 0} steps
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-4">
                {workflow.stages ? (
                  workflow.stages.map((stage, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center w-full sm:w-auto">
                      <div className="flex flex-col items-center gap-2 sm:gap-[10px] w-full p-3 sm:p-[20px] rounded-lg border border-[#e5e7eb]">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: stage.stage.color }}
                        />
                        <span className="text-xs sm:text-sm font-medium text-[#111928] text-center">{stage.stage.name}</span>
                        <span className="text-xs text-[#111928] border border-[#e5e7eb] rounded-full px-3 sm:px-[20px] py-1 sm:py-[2px]">
                          {stage.stage.days}d
                        </span>
                      </div>
                      {index < workflow.stages.length - 1 && (
                        <span className="text-[#111928] my-2 sm:mx-[10px] sm:rotate-0 rotate-90 text-center">→</span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-[#9ca3af]">Stages Data Not Found</span>
                )}
              </div>
              {isAllowed ? "" : (
              <div className="absolute top-4 right-4">
                <button
                  className="dropdown-button hover:text-[#2563eb] transition"
                  onClick={(e) => handleMenuClick(workflow.id, e)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="10" cy="4" r="2" />
                    <circle cx="10" cy="10" r="2" />
                    <circle cx="10" cy="16" r="2" />
                  </svg>
                </button>
                <DropdownMenu
                  workflowId={workflow.id}
                  menuPosition={menuPosition}
                  menuOpen={menuOpen}
                  onDelete={() => {
                    setSelectedWorkflow(workflow);
                    setDeletePopupOpen(true);
                  }}
                />
              </div>
              )}
            </div>
          ))}
        </div>
      )}
      <CreateWorkflowPopup
        isOpen={createPopupOpen}
        onClose={() => setCreatePopupOpen(false)}
        onSave={handleCreateWorkflow}
      />
      <DeleteWorkflowPopup
        isOpen={deletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        workflowId={selectedWorkflow?.id}
        onDelete={handleDeleteWorkflow}
      />
      <ToastContainer />
    </div>
  );
}