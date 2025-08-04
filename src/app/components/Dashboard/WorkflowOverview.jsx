"use client";
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function WorkflowOverview() {
  const [workflowStats, setWorkflowStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflowData = async () => {
      setIsLoading(true);
      try {
        // Fetch workflows
        const workflowsResponse = await fetch('https://printmanager-api.onrender.com/api/workflows');
        if (!workflowsResponse.ok) {
          const errorData = await workflowsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch workflows');
        }
        const workflows = await workflowsResponse.json();
        const workflowsArray = Array.isArray(workflows) ? workflows : [];

        // Fetch orders
        const ordersResponse = await fetch('https://printmanager-api.onrender.com/api/orders');
        if (!ordersResponse.ok) {
          const errorData = await ordersResponse.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
        const orders = await ordersResponse.json();
        const ordersArray = Array.isArray(orders) ? orders : [];

        // Create a map of workflow ID to its stages
        const workflowStageMap = {};
        workflowsArray.forEach(workflow => {
          workflowStageMap[workflow.id] = {
            title: workflow.title,
            stages: workflow.stages.map(stage => stage.title),
            color: workflow.stages.length > 0 ? workflow.stages[0].color : '#6b7280' // Use first stage's color or fallback
          };
        });

        // Count orders per workflow
        const workflowCounts = {};
        ordersArray.forEach(order => {
          const countedWorkflows = new Set(); // Track workflows counted for this order
          order.items.forEach(item => {
            if (item.currentStage) {
              // Find which workflow this stage belongs to
              for (const workflowId in workflowStageMap) {
                if (workflowStageMap[workflowId].stages.includes(item.currentStage) && !countedWorkflows.has(workflowId)) {
                  workflowCounts[workflowId] = (workflowCounts[workflowId] || 0) + 1;
                  countedWorkflows.add(workflowId);
                }
              }
            }
          });
        });

        // Prepare workflow stats for all workflows
        const stats = workflowsArray.map(workflow => ({
          id: workflow.id,
          name: workflow.title,
          count: workflowCounts[workflow.id] || 0,
          color: workflowStageMap[workflow.id]?.color || '#6b7280'
        })).sort((a, b) => a.id - b.id); // Sort by workflow ID

        setWorkflowStats(stats);
        setError(null);
      } catch (error) {
        console.error('Error fetching workflow data:', error);
        setError(error.message);
        toast.error(error.message || 'Error fetching workflow data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowData();
  }, []);

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-[105px] pt-7.5 border-[1px] border-[#e5e7eb]">
      <h2 className="font-medium text-gray-800 text-[24px]">Workflow Overview</h2>
      <p className="text-[18px] text-[#9ca3af] mb-4">Orders by workflow</p>
      <div className="space-y-6">
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
        ) : error ? (
          <div className="text-center py-10 text-[#ef4444] text-lg">
            Error: {error}
          </div>
        ) : workflowStats.length === 0 ? (
          <div className="text-center py-10 text-[#9ca3af] text-lg">
            No Workflows Found
          </div>
        ) : (
          workflowStats.map((workflow) => (
            <div key={workflow.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${workflow.color}`} />
                  <span className="text-sm font-medium text-[#111928]">
                    {workflow.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-[#111928]">{workflow.count}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div
                  className={`h-3 rounded-full bg-[${workflow.color}] `}
                  style={{ width: workflow.count > 0 ? '1%' : '0%' }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default WorkflowOverview;