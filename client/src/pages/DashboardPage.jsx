import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UploadForm from '../components/UploadForm';
import ChatbotPanel from '../components/ChatbotPanel';

const DashboardPage = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleUploadSuccess = (prescriptionId) => {
    navigate(`/prescription-view/${prescriptionId}`);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
          navigate('/login');
          return;
        }
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const res = await API.get('/api/auth/profile', config);
        setUserName(res.data.name);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    };
    fetchUserProfile();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-semibold text-gray-800">Welcome, {userName}!</h1>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Upload New Prescription</h2>
                <UploadForm onUploadSuccess={handleUploadSuccess} />
              </div>
              {/* Other dashboard widgets can go here */}
            </div>

            <div className="mt-8">
              <ChatbotPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
