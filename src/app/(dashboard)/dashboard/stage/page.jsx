'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import Stage from '@/app/components/Stage/Stage';
import React from 'react';

export default function StagePage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Create Stage" />
      <Stage />
    </div>
  );
}