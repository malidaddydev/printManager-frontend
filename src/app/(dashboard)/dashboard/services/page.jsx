'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import Services from '@/app/components/Services/Services';
import React, { useEffect, useState } from 'react';

export default function ServicesPage() {
  const [isAllowed, setIsAllowed] = useState(false);
    
  useEffect(() => {
    const email = sessionStorage.getItem('email');

    fetch('https://printmanager-api.onrender.com/api/users')
      .then((res) => res.json())
      .then((users) => {
        const user = users.find((u) => u.email === email);
        if (!user || user.isMember === true) {
          setIsAllowed(true);
        } 
      })
  }, []);
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName={isAllowed ? "Services" : "Create Services"} />
      <Services />
    </div>
  );
}