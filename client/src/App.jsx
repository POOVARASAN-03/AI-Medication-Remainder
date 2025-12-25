import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'; // Import Outlet
import { Toaster, toast } from 'react-hot-toast';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseConfig from './firebaseConfig';
import { initializeApp } from 'firebase/app';
import API from './services/api';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import RemindersPage from './pages/RemindersPage'; // Import RemindersPage
import PrescriptionViewPage from './pages/PrescriptionViewPage';
import PrescriptionRemindersPage from './pages/PrescriptionRemindersPage'; // Import PrescriptionRemindersPage
import ProfilePage from './pages/ProfilePage';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import Chatbot from './components/Chatbot';

// Layout component for authenticated routes
const PrivateLayout = ({ isSidebarOpen, toggleSidebar }) => (
  <div className="flex h-screen bg-slate-50">
    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} md:ml-64`}>
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
      <Chatbot />
    </div>
  </div>
);

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar toggle

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const firebaseApp = initializeApp(firebaseConfig);
    const messaging = getMessaging(firebaseApp);

    Notification.requestPermission()
      .then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
            .then((currentToken) => {
              if (currentToken) {
                console.log('FCM Token:', currentToken);
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const userId = userInfo ? userInfo._id : null;

                if (userId) {
                  API.post('/api/store-fcm-token', { userId, fcmToken: currentToken })
                    .catch(err => console.error('Failed to store FCM token:', err));
                } else {
                  console.log('User not logged in, cannot store FCM token.');
                }
              } else {
                console.log('No registration token available.');
              }
            })
            .catch((err) => {
              console.error('Error getting token:', err);
            });
          console.log('Notification permission denied.');
        }
      });

    // Handle foreground messages - only log, let service worker display notification
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      // The service worker handles displaying the notification, including for foreground messages.
      // We might want to update some UI element here, e.g., a notification badge.
      // For now, just logging.
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1e293b',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            duration: 5000,
          },
        }}
      />
      <Routes>
        {/* Public root route - redirect based on auth status */}
        <Route 
          path="/" 
          element={
            localStorage.getItem('userInfo') 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<PrivateLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}>
            <Route path="dashboard" element={<DashboardPage toggleSidebar={toggleSidebar} />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="reminders/:prescriptionId" element={<PrescriptionRemindersPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="prescription-view/:id" element={<PrescriptionViewPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
