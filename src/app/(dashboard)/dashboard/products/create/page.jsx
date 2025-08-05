'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs'
import CreateProduct from '@/app/components/CreateProduct/Create'
import React from 'react'

function CreateProductsPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Create Product" />
      <CreateProduct />
    </div>
  )
}

export default CreateProductsPage