'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs'
import ProductList from '@/app/components/CreateProduct/ProductList'
import React from 'react'

function ProductsListPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Product List" />
      <ProductList />
    </div>
  )
}

export default ProductsListPage