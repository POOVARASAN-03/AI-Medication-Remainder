import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import UploadForm from '../components/UploadForm';
import ChatbotPanel from '../components/ChatbotPanel';

const DashboardPage = ({ toggleSidebar }) => {
  const [userName, setUserName] = useState('');
  const [lastUploadedPrescription, setLastUploadedPrescription] = useState(null);
  const navigate = useNavigate();

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

        // Check for last uploaded prescription from localStorage
        const storedPrescription = localStorage.getItem('lastUploadedPrescription');
        if (storedPrescription) {
          const parsedPrescription = JSON.parse(storedPrescription);
          setLastUploadedPrescription(parsedPrescription);
        }

      } catch (err) {
        console.error('Error fetching user profile:', err);
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    };
    fetchUserProfile();
  }, [navigate]);

  const handleUploadSuccess = (prescriptionId) => {
    // Update localStorage and state after a successful upload
    const newPrescriptionData = {
      id: prescriptionId,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('lastUploadedPrescription', JSON.stringify(newPrescriptionData));
    setLastUploadedPrescription(newPrescriptionData);
    navigate(`/prescription-view/${prescriptionId}`);
  };

  const handleViewLastPrescription = () => {
    if (lastUploadedPrescription && lastUploadedPrescription.id) {
      navigate(`/prescription-view/${lastUploadedPrescription.id}`);
    }
  };

  const handleAddAnotherPrescription = () => {
    // Clear the last prescription data to show the UploadForm again
    localStorage.removeItem('lastUploadedPrescription');
    setLastUploadedPrescription(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Welcome, {userName}!</h1>
        {/* Toggle button for sidebar on larger screens */}
        <button
          onClick={toggleSidebar}
          className="hidden md:block p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
          aria-label="Toggle sidebar"
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
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {lastUploadedPrescription ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Last Uploaded Prescription</h2>
              <p className="text-gray-600 mb-4">
                Uploaded on: {new Date(lastUploadedPrescription.timestamp).toLocaleDateString()}
              </p>
              <button
                onClick={handleViewLastPrescription}
                className="mr-4 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
              >
                View Last Prescription
              </button>
              <button
                onClick={handleAddAnotherPrescription}
                className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-900"
              >
                Add Another Prescription
              </button>
            </div>
          ) : (
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          )}
        </div>
        {/* Other dashboard widgets can go here */}
      </div>

      <div className="mt-8">
        <ChatbotPanel />
      </div>
    </div>
  );
};

export default DashboardPage;
