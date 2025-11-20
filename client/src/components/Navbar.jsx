import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        {/* Hamburger icon for mobile to open sidebar */}
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
          aria-label="Open sidebar"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Link to="/dashboard" className="text-xl font-bold text-gray-800">AI-Reminder</Link>
      </div>
      <nav>
        {userInfo ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {userInfo.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
