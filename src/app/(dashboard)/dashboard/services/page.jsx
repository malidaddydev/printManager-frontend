'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import Services from '@/app/components/Services/Services';
import React from 'react';

export default function ServicesPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Services" />
      <Services />
    </div>
  );
}