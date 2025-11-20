import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import API from '../services/api';
// import Navbar from '../components/Navbar'; // Navbar is now rendered by PrivateLayout
// import Sidebar from '../components/Sidebar'; // Sidebar is now rendered by PrivateLayout

const HistoryPage = () => {
  const [reminderHistory, setReminderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchReminderHistory = async () => {
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
        const res = await API.get('/api/reminders/history', config);
        setReminderHistory(res.data);
      } catch (err) {
        console.error('Error fetching reminder history:', err);
        setError(err.response?.data?.message || 'Failed to fetch history');
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReminderHistory();
  }, [navigate]); // Add navigate to dependency array

  const updateStatus = async (id, status) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json',
        },
      };
      // Corrected endpoint: Use /api/reminders/:id
      await API.put(`/api/reminders/${id}`, { status }, config);
      setReminderHistory((prevHistory) =>
        prevHistory.map((item) => (item._id === id ? { ...item, status } : item))
      );
    } catch (err) {
      console.error('Error updating reminder status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* <Sidebar /> // Removed direct rendering */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <Navbar /> // Removed direct rendering */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              <p>Loading history...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* <Sidebar /> // Removed direct rendering */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <Navbar /> // Removed direct rendering */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              <p className="text-red-500">Error: {error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Sidebar /> // Removed direct rendering */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Navbar /> // Removed direct rendering */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Reminder History</h1>
            {reminderHistory.length === 0 ? (
              <p>No reminder history available.</p>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notify Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reminderHistory.map((record) => (
                      <tr key={record._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{record.medicineName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(record.triggerDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.scheduledTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.notificationMethod}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'sent' || record.status === 'failed'
                                ? 'bg-blue-100 text-blue-800' // Use blue for sent/failed (pending action)
                                : record.status === 'taken'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {(record.status === 'sent' || record.status === 'failed') && (
                            <>
                              <button
                                onClick={() => updateStatus(record._id, 'taken')}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                Mark Taken
                              </button>
                              <button
                                onClick={() => updateStatus(record._id, 'missed')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Mark Missed
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
