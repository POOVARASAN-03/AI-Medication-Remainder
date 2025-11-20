import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import MedicineTable from '../components/MedicineTable';
import ChatbotPanel from '../components/ChatbotPanel';

const PrescriptionViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [autoReminders, setAutoReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoReminderMessage, setAutoReminderMessage] = useState(null);
  const [reminderForm, setReminderForm] = useState({
    medicineName: '',
    timeSlot: '', // Changed from 'time' to 'timeSlot' to map to backend
    startDate: '',
    endDate: '',
    notificationMethod: 'email', // Default to email
    whatsappNumber: '', // Initialize whatsappNumber
  });
  const [setReminderMessage, setSetReminderMessage] = useState(null);
  const [setReminderError, setSetReminderError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch prescription details
        const prescriptionRes = await API.get(`/api/prescriptions/${id}`, config);
        setPrescription(prescriptionRes.data);

        // Fetch auto-generated reminders for this prescription
        const remindersRes = await API.get(`/api/reminders?prescriptionId=${id}`, config);
        setAutoReminders(remindersRes.data);

        // Display auto-reminder message
        if (remindersRes.data.length > 0) {
          setAutoReminderMessage('Medication reminders automatically created!');
        }

        // Set initial reminder form state with first medicine if available
        if (prescriptionRes.data.medicines.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const defaultEndDate = new Date();
          defaultEndDate.setDate(defaultEndDate.getDate() + 30); // Default to 30 days duration
          setReminderForm(prev => ({
            ...prev,
            medicineName: prescriptionRes.data.medicines[0].name,
            startDate: today,
            endDate: defaultEndDate.toISOString().split('T')[0],
          }));
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleReminderFormChange = (e) => {
    setReminderForm({ ...reminderForm, [e.target.name]: e.target.value });
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

      console.log('Frontend sending whatsappNumber:', reminderForm.whatsappNumber); // Debug log
      // The backend expects prescription, startDate, endDate, and will use user's stored notifyBy/whatsapp/email
      await API.post('/api/reminders', {
        prescription: id,
        medicineName: reminderForm.medicineName,
        timeSlot: reminderForm.timeSlot,
        startDate: reminderForm.startDate,
        endDate: reminderForm.endDate,
        notificationMethod: reminderForm.notificationMethod,
        whatsappNumber: reminderForm.whatsappNumber, // Pass whatsappNumber from form
      }, config);
      setSetReminderMessage('Reminder set successfully!');
      // Optionally, refetch auto-reminders to update the list
      // fetchData();
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Prescription Details</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Uploaded Image</h2>
                {/* Corrected image source to handle Cloudinary URLs directly */}
                <img
                  src={prescription.image}
                  alt="Prescription"
                  className="max-w-full h-auto rounded-lg shadow-sm mb-6"
                />

                <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
                <p className="bg-gray-100 p-4 rounded-md text-gray-700 whitespace-pre-wrap mb-6">
                  {prescription.extractedText}
                </p>

                <h2 className="text-xl font-semibold mb-4">Medicines & Interactions</h2>
                <MedicineTable medicines={prescription.medicines} interactions={prescription.interactions} />

                {autoReminderMessage && (
                  <div className="mt-8 p-4 bg-green-100 text-green-800 rounded-lg shadow-sm">
                    <p className="font-semibold">{autoReminderMessage}</p>
                  </div>
                )}

                {/* Manual Set Reminder Form */}
                <div className="mt-8 p-6 bg-blue-50 rounded-lg shadow-inner">
                  <h2 className="text-xl font-semibold text-blue-800 mb-4">Set Manual Reminder</h2>
                  {setReminderMessage && <p className="text-green-600 mb-4">{setReminderMessage}</p>}
                  {setReminderError && <p className="text-red-500 mb-4">{setReminderError}</p>}
                  <form onSubmit={handleSetReminder} className="space-y-4">
                    <div>
                      <label htmlFor="medicineName" className="block text-sm font-medium text-blue-700">Medicine</label>
                      <select
                        id="medicineName"
                        name="medicineName"
                        value={reminderForm.medicineName}
                        onChange={handleReminderFormChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        {prescription.medicines.map((med) => (
                          <option key={med.name} value={med.name}>
                            {med.name} ({med.dosage})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="timeSlot" className="block text-sm font-medium text-blue-700">Time Slot</label>
                      <select
                        id="timeSlot"
                        name="timeSlot"
                        value={reminderForm.timeSlot}
                        onChange={handleReminderFormChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select Time Slot</option>
                        <option value="morning">Morning (08:00)</option>
                        <option value="afternoon">Afternoon (13:00)</option>
                        <option value="evening">Evening (18:00)</option>
                        <option value="night">Night (21:00)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-blue-700">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={reminderForm.startDate}
                        onChange={handleReminderFormChange}
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
                        value={reminderForm.endDate}
                        onChange={handleReminderFormChange}
                        className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="notificationMethod" className="block text-sm font-medium text-blue-700">Notify By</label>
                      <select
                        id="notificationMethod"
                        name="notificationMethod"
                        value={reminderForm.notificationMethod}
                        onChange={handleReminderFormChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    {(reminderForm.notificationMethod === 'whatsapp' || reminderForm.notificationMethod === 'both') && (
                      <div>
                        <label htmlFor="whatsappNumber" className="block text-sm font-medium text-blue-700">WhatsApp Number (e.g., +919876543210)</label>
                        <input
                          type="text"
                          id="whatsappNumber"
                          name="whatsappNumber"
                          value={reminderForm.whatsappNumber || ''}
                          onChange={handleReminderFormChange}
                          className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+[Country Code][Number]"
                          required={reminderForm.notificationMethod === 'whatsapp' || reminderForm.notificationMethod === 'both'}
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Set Reminder
                    </button>
                  </form>
                </div>

                {autoReminders.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Auto-Generated Reminders</h2>
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
                          {autoReminders.map((reminder) => (
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

                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => navigate('/reminders')}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    View All Reminders
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    View Reminder History
                  </button>
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
