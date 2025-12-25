import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown, Bell, Clock, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../services/api';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [recentReminders, setRecentReminders] = useState([]);

  useEffect(() => {
    if (userInfo) {
      fetchRecentReminders();
    }
  }, []);

  const fetchRecentReminders = async () => {
    try {
      const response = await API.get('/api/reminders/recent');
      setRecentReminders(response.data);
    } catch (error) {
      console.error('Error fetching recent reminders:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') {
      return `Welcome back, ${userInfo?.name || 'User'}!`;
    }
    switch (location.pathname) {
      case '/reminders':
        return 'Active Reminders';
      case '/history':
        return 'Prescription History';
      case '/profile':
        return 'My Profile';
      default:
        return 'Overview';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 h-20 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Mobile: Show logo and title */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="p-1.5 bg-primary-100 rounded-lg">
            <Pill className="w-5 h-5 text-primary-600" />
          </div>
          <span className="text-lg font-heading font-bold text-slate-900">MedRemind AI</span>
        </div>

        {/* Desktop: Show page title */}
        <h1 className="text-2xl font-heading font-bold text-slate-800 hidden md:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {recentReminders.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Recent Reminders</h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {recentReminders.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No recent reminders</p>
                    </div>
                  ) : (
                    recentReminders.map((reminder, index) => (
                      <div
                        key={reminder._id}
                        className="px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-4 h-4 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">
                              {reminder.medicineName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                {reminder.scheduledTime}
                              </div>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs text-slate-500">
                                {formatDate(reminder.triggerDate)}
                              </span>
                            </div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${reminder.status === 'taken'
                                ? 'bg-green-100 text-green-700'
                                : reminder.status === 'missed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                              {reminder.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {userInfo ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{userInfo.name}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50"
                >
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{userInfo.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
