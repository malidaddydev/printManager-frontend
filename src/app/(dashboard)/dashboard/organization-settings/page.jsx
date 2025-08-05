'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import OrganizationSettings from '@/app/components/OrganizationSettings/OrganizationSettings';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizationSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Organization Settings" />
      <OrganizationSettings />
    </div>
  );
}