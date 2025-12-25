import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, History, X, Menu, User, Pill } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'History', path: '/history', icon: History },
  ];

  const bottomLinks = [
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 transform flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Pill className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xl font-heading font-bold text-slate-900">MedRemind AI</span>
          </div>
          {isOpen ? (
            <button
              onClick={toggleSidebar}
              className="md:hidden text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="md:hidden text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={toggleSidebar}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-primary-50 text-primary-700 font-medium shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}
                  }`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile at the bottom */}
        <div className="p-4 border-t border-slate-100">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={toggleSidebar}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-primary-50 text-primary-700 font-medium shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}
                  }`} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
