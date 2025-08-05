'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import Notification from '@/app/components/Notification/Notification';
import React from 'react';

export default function NotificationsPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Notification" />
      <Notification />
    </div>
  );
}