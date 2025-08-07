'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [orgData, setOrgData] = useState({ logo: null, name: null });
  const router = useRouter();

  useEffect(() => {
    // Fetch organization settings
    fetch('https://printmanager-api.onrender.com/api/organization-settings')
      .then(response => response.json())
      .then(data => {
        setOrgData({
          logo: data.logo,
          name: data.name,
        });
      })
      .catch(error => {
        console.error('Error fetching organization data:', error);
      });
  }, []);

  const handleRedirect = () => {
    if (sessionStorage.getItem('authToken')) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 md:px-8 lg:px-12">
      {orgData.logo && (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40">
          <Image
            src={orgData.logo}
            alt="Organization Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      )}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-center text-[#111928]">
        {orgData.name}
      </h1>
      <button
        onClick={handleRedirect}
        className="bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-lg font-medium text-sm sm:text-base md:text-lg hover:bg-blue-700 transition flex items-center justify-center"
      >
        Get Started
      </button>
    </div>
  );
}