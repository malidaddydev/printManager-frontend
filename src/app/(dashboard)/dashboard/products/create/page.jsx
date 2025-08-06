'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs'
import CreateProduct from '@/app/components/CreateProduct/Create'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

function CreateProductsPage() {
    const router = useRouter();
    const [isAllowed, setIsAllowed] = useState(false);
  
    useEffect(() => {
      const email = sessionStorage.getItem('email');
  
      fetch('https://printmanager-api.onrender.com/api/users')
        .then((res) => res.json())
        .then((users) => {
          const user = users.find((u) => u.email === email);
          if (!user || user.isMember === true) {
            router.push('/dashboard');
          } else {
            setIsAllowed(true);
          }
        })
        .catch(() => {
          router.push('/dashboard');
        });
    }, [router]);
  
  
    if (!isAllowed) return null;
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Create Product" />
      <CreateProduct />
    </div>
  )
}

export default CreateProductsPage