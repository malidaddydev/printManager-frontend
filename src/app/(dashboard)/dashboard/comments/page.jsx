'use client';
import Breadcrumbs from '@/app/components/Breadcrumbs/Breadcrumbs';
import Comments from '@/app/components/Comments/Comments';
import React from 'react';

export default function CommentsPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <Breadcrumbs pageName="Comments" />
      <Comments />
    </div>
  );
}