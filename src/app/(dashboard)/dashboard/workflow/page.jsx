'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import Workflow from '@/app/components/Workflow/Workflow';
import React from 'react';

export default function WorkFlowPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Create Workflow" />
      <Workflow />
    </div>
  );
}