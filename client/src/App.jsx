import React, { useState } from 'react'; // Import useState
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'; // Import Outlet

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import RemindersPage from './pages/RemindersPage'; // Import RemindersPage
import PrescriptionViewPage from './pages/PrescriptionViewPage';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';

// Layout component for authenticated routes
const PrivateLayout = ({ isSidebarOpen, toggleSidebar }) => (
  <div className="flex h-screen bg-gray-100">
    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} md:ml-64`}> {/* Adjusted margin for sidebar on desktop */}
      <Navbar toggleSidebar={toggleSidebar} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
        <div className="container mx-auto px-6 py-8">
          <Outlet /> {/* Renders the nested route's component */}
        </div>
      </main>
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
