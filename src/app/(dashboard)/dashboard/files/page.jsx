'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import Files from '@/app/components/Files/Files';
import React from 'react';

export default function FilesPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Files" />
      <Files />
    </div>
  );
}