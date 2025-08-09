'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import Stage from '@/app/components/Stage/Stage';
import React, { useEffect, useState } from 'react';

export default function StagePage() {
    const [isAllowed, setIsAllowed] = useState(false);
  
    useEffect(() => {
      const email = sessionStorage.getItem('email');
  
      fetch('https://printmanager-api.onrender.com/api/users', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      })
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
      <Breadcrumbs pageName={isAllowed ? "Stage" : "Create Stage"} />
      <Stage />
    </div>
  );
}