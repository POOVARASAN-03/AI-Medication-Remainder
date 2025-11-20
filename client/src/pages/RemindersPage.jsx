import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
// import Navbar from '../components/Navbar'; // Navbar is now rendered by PrivateLayout
// import Sidebar from '../components/Sidebar'; // Sidebar is now rendered by PrivateLayout

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReminders = async () => {
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
        const res = await API.get('/api/reminders', config);
        setReminders(res.data);
      } catch (err) {
        console.error('Error fetching reminders:', err);
        setError(err.response?.data?.message || 'Failed to fetch reminders');
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* <Sidebar /> // Removed direct rendering */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <Navbar /> // Removed direct rendering */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              <p>Loading reminders...</p>
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
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Your Active Reminders</h1>

            {reminders.length === 0 ? (
              <p className="text-gray-600">No active reminders found. Upload a prescription to get started!</p>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Medicine</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dosage</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notify By</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reminders.map((reminder) => (
                        <tr key={reminder._id}>
                          <td className="py-2 px-4 border-b border-gray-200">{reminder.medicineName}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{reminder.dosage}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{reminder.time}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{`${reminder.startDate} to ${reminder.endDate}`}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{reminder.notifyBy}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{reminder.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RemindersPage;
