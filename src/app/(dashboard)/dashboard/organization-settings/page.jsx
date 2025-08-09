'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import OrganizationSettings from '@/app/components/OrganizationSettings/OrganizationSettings';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizationSettingsPage() {
  const router = useRouter();
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
        if (!user || user.isManager === true || user.isAdmin !== true) {
          router.push('/dashboard');
        } else {
          setIsAllowed(true);
        }
      })
      .catch(() => {
        router.push('/dashboard');
      });
  }, [router]);

  if (!isAllowed) return null; // Page block jab tak allowed na ho

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Organization Settings" />
      <OrganizationSettings />
    </div>
  );
}
