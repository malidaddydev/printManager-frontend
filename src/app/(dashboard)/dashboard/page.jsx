'use client';
import DashboardCard from '@/app/components/Dashboard/DashboardCard';
import OverdueAlerts from '@/app/components/Dashboard/OverdueAlerts';
import RecentOrder from '@/app/components/Dashboard/RecentOrder';
import TeamPerformance from '@/app/components/Dashboard/TeamPerformance';
import WorkflowOverview from '@/app/components/Dashboard/WorkflowOverview';
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
      <DashboardCard />
      <RecentOrder />
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <WorkflowOverview />
        <TeamPerformance />
      </div>
      <OverdueAlerts />
    </div>
  );
}