import React, { useState } from 'react'; // Import useState
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'; // Import Outlet
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import RemindersPage from './pages/RemindersPage'; // Import RemindersPage
import PrescriptionViewPage from './pages/PrescriptionViewPage';

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute />}>
          <Route element={<PrivateLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}>
            <Route path="dashboard" element={<DashboardPage toggleSidebar={toggleSidebar} />} /> {/* Pass toggleSidebar */}
            <Route path="history" element={<HistoryPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="prescription-view/:id" element={<PrescriptionViewPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
