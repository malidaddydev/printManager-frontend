'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import CustomerList from '@/app/components/CreateCustomer/CustomerList';
import React from 'react';

export default function CustomerListPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Customer List" />
      <CustomerList />
    </div>
  );
}