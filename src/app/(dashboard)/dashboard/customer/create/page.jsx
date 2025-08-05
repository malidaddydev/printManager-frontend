'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import Create from '@/app/components/CreateCustomer/Create';
import React from 'react';

export default function CustomerCreatePage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Create Customer" />
      <Create />
    </div>
  );
}