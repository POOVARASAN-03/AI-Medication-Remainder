import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Reminders', path: '/reminders' },
    { name: 'History', path: '/history' },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white shadow-lg transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      <div className="flex items-center justify-between h-16 border-b border-gray-700 px-4">
        <span className="text-2xl font-bold">Med Reminder</span>
        {/* Hamburger icon for mobile view to close sidebar */}
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-400 hover:text-white focus:outline-none focus:text-white"
          aria-label="Close sidebar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={toggleSidebar} // Close sidebar on link click (for mobile)
            className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${location.pathname === link.path
              ? 'bg-gray-700 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
