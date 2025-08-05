import React, { useState, useEffect } from 'react';

// SVG Icon for Total Users
const TotalUsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#2563EB"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-users h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

// SVG Icon for Active Users
const ActiveUsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#16A34A"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-user-check h-3 w-3 sm:h-4 sm:w-4"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <polyline points="16 11 18 13 22 9"></polyline>
  </svg>
);

// SVG Icon for Deactive Users
const InActiveUsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#C026D3"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-shield h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
  </svg>
);

// SVG Icon for Teams
const TeamsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#EA580C"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-users h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const UserCard = () => {
  // State to store API counts
  const [stats, setStats] = useState([
    {
      title: "Total Users",
      count: 0,
      description: "Registered users",
      color: "bg-[#2563EB]",
      icon: <TotalUsersIcon />,
    },
    {
      title: "Active Users",
      count: 0,
      description: "Currently active",
      color: "bg-[#16A34A]",
      icon: <ActiveUsersIcon />,
    },
    {
      title: "Deactive Users",
      count: 0,
      description: "Currently deactive",
      color: "bg-[#C026D3]",
      icon: <InActiveUsersIcon />,
    },
    {
      title: "Teams",
      count: 0,
      description: "Active teams",
      color: "bg-[#EA580C]",
      icon: <TeamsIcon />,
    },
  ]);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Total Users
        const totalUsersResponse = await fetch('https://printmanager-api.onrender.com/api/users', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        });
        const totalUsersData = await totalUsersResponse.json();
        const totalUsersCount = Array.isArray(totalUsersData) ? totalUsersData.length : 0;

        // Fetch Active Users
        const activeUsersResponse = await fetch('https://printmanager-api.onrender.com/api/users/active', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        });
        const activeUsersData = await activeUsersResponse.json();
        const activeUsersCount = Array.isArray(activeUsersData) ? activeUsersData.length : 0;

        // Fetch Deactive Users
        const deactiveUsersResponse = await fetch('https://printmanager-api.onrender.com/api/users/deactive', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        });
        const deactiveUsersData = await deactiveUsersResponse.json();
        const deactiveUsersCount = Array.isArray(deactiveUsersData) ? deactiveUsersData.length : 0;

        // Simulate Teams API (replace with actual API later)
        // For now, using a random number as a placeholder
        const teamsCount = 5; // Replace with actual API fetch when available

        // Update stats state
        setStats([
          {
            ...stats[0],
            count: totalUsersCount,
          },
          {
            ...stats[1],
            count: activeUsersCount,
          },
          {
            ...stats[2],
            count: deactiveUsersCount,
          },
          {
            ...stats[3],
            count: teamsCount,
          },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Optionally, set fallback counts or show an error message
      }
    };

    fetchData();
  }, []); // Empty dependency array to run once on mount

  return (
    <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4 sm:mt-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-lg bg-white p-4 sm:p-5 md:p-6 border border-[#e5e7eb]"
        >
          <div
            className={`${stat.color} w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-3 sm:mb-4`}
          >
            {stat.icon}
          </div>
          <div className="flex items-end justify-between">
            <dl>
              <dt className="mb-1 sm:mb-1.5 text-lg sm:text-xl md:text-2xl font-bold text-[#111928]">{stat.count}</dt>
              <dd className="text-xs sm:text-sm text-[#9ca3af]">{stat.title}</dd>
            </dl>
            <dl className="text-xs sm:text-sm text-[#9ca3af]">
              <dt className="flex items-center gap-1">{stat.description}</dt>
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCard;