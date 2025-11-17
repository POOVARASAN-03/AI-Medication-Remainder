import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MedicineTable from '../components/MedicineTable';
import ChatbotPanel from '../components/ChatbotPanel';

const PrescriptionViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminderDetails, setReminderDetails] = useState({
    medicineName: '',
    time: '',
    startDate: '',
    endDate: '',
  });
  const [setReminderMessage, setSetReminderMessage] = useState(null);
  const [setReminderError, setSetReminderError] = useState(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const res = await API.get(`/api/prescriptions/${id}`, config);
        setPrescription(res.data);
      } catch (err) {
        console.error('Error fetching prescription:', err);
        setError(err.response?.data?.message || 'Failed to fetch prescription');
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [id, navigate]);

  const handleReminderChange = (e) => {
    setReminderDetails({ ...reminderDetails, [e.target.name]: e.target.value });
  };

  const handleSetReminder = async (e) => {
    e.preventDefault();
    setSetReminderMessage(null);
    setSetReminderError(null);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json',
        },
      };
      await API.post('/api/reminders', { ...reminderDetails, prescription: id }, config);
      setSetReminderMessage('Reminder set successfully!');
      setReminderDetails({
        medicineName: '',
        time: '',
        startDate: '',
        endDate: '',
      });
    } catch (err) {
      console.error('Error setting reminder:', err);
      setSetReminderError(err.response?.data?.message || 'Failed to set reminder');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              <p>Loading prescription details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              <p className="text-red-500">Error: {error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              <p>Prescription not found.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Prescription Details</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Uploaded Image</h2>
                <img
                  src={`http://localhost:5001/${prescription.image}`}
                  alt="Prescription"
                  className="max-w-full h-auto rounded-lg shadow-sm mb-6"
                />

                <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
                <p className="bg-gray-100 p-4 rounded-md text-gray-700 whitespace-pre-wrap mb-6">
                  {prescription.extractedText}
                </p>

                <h2 className="text-xl font-semibold mb-4">Medicines & Interactions</h2>
                <MedicineTable medicines={prescription.medicines} interactions={prescription.interactions} />

                <div className="mt-8 p-6 bg-blue-50 rounded-lg shadow-inner">
                  <h2 className="text-xl font-semibold text-blue-800 mb-4">Set Reminder</h2>
                  {setReminderMessage && <p className="text-green-600 mb-4">{setReminderMessage}</p>}
                  {setReminderError && <p className="text-red-500 mb-4">{setReminderError}</p>}
                  <form onSubmit={handleSetReminder} className="space-y-4">
                    <div>
                      <label htmlFor="medicineName" className="block text-sm font-medium text-blue-700">Medicine Name</label>
                      <input
                        type="text"
                        id="medicineName"
                        name="medicineName"
                        value={reminderDetails.medicineName}
                        onChange={handleReminderChange}
                        className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-blue-700">Time (HH:MM)</label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={reminderDetails.time}
                        onChange={handleReminderChange}
                        className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-blue-700">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={reminderDetails.startDate}
                        onChange={handleReminderChange}
                        className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-blue-700">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={reminderDetails.endDate}
                        onChange={handleReminderChange}
                        className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Set Reminder
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-1">
                <ChatbotPanel />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrescriptionViewPage;
