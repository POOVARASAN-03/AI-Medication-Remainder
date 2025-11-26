import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import MedicineTable from '../components/MedicineTable';
import { Calendar, Clock, Bell, FileText, Image as ImageIcon, ArrowLeft } from 'lucide-react';

const PrescriptionViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [autoReminders, setAutoReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminderForm, setReminderForm] = useState({
    medicineName: '',
    timeSlot: '',
    startDate: '',
    endDate: '',
    notificationMethod: 'email',
    whatsappNumber: '',
  });

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

        const prescriptionRes = await API.get(`/api/prescriptions/${id}`, config);
        setPrescription(prescriptionRes.data);

        const remindersRes = await API.get(`/api/reminders?prescriptionId=${id}`, config);
        setAutoReminders(remindersRes.data);

        if (remindersRes.data.length > 0) {
          toast.info('Medication reminders automatically created!');
        }

        if (prescriptionRes.data.medicines.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const defaultEndDate = new Date();
          defaultEndDate.setDate(defaultEndDate.getDate() + 30);
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
        toast.error(err.response?.data?.message || 'Failed to load prescription details');
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

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json',
        },
      };

      await API.post('/api/reminders', {
        prescription: id,
        medicineName: reminderForm.medicineName,
        timeSlot: reminderForm.timeSlot,
        startDate: reminderForm.startDate,
        endDate: reminderForm.endDate,
        notificationMethod: reminderForm.notificationMethod,
        whatsappNumber: reminderForm.whatsappNumber,
      }, config);
      toast.success('Reminder set successfully!');
    } catch (err) {
      console.error('Error setting reminder:', err);
      toast.error(err.response?.data?.message || 'Failed to set reminder');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading prescription details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium">Error: {error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!prescription) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-gray-700 hover:shadow-sm"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prescription Details</h1>
                <p className="text-gray-500 text-sm">View and manage extracted medication details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="xl:col-span-2 space-y-8">

                {/* Medicines Table Section */}
                <section>
                  <MedicineTable medicines={prescription.medicines} interactions={prescription.interactions} />
                </section>

                {/* Set Reminder Section */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Set Manual Reminder</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Configure a new reminder for your medication</p>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleSetReminder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="medicineName" className="block text-sm font-medium text-gray-700">Medicine</label>
                        <select
                          id="medicineName"
                          name="medicineName"
                          value={reminderForm.medicineName}
                          onChange={handleReminderFormChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          required
                        >
                          {prescription.medicines.map((med) => (
                            <option key={med.name} value={med.name}>
                              {med.name} ({med.dosage})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">Time Slot</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            id="timeSlot"
                            name="timeSlot"
                            value={reminderForm.timeSlot}
                            onChange={handleReminderFormChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            required
                          >
                            <option value="">Select Time Slot</option>
                            <option value="morning">Morning (08:00)</option>
                            <option value="afternoon">Afternoon (13:00)</option>
                            <option value="evening">Evening (18:00)</option>
                            <option value="night">Night (21:00)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={reminderForm.startDate}
                            onChange={handleReminderFormChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={reminderForm.endDate}
                            onChange={handleReminderFormChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="notificationMethod" className="block text-sm font-medium text-gray-700">Notify By</label>
                        <select
                          id="notificationMethod"
                          name="notificationMethod"
                          value={reminderForm.notificationMethod}
                          onChange={handleReminderFormChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          required
                        >
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="both">Both</option>
                        </select>
                      </div>

                      {(reminderForm.notificationMethod === 'whatsapp' || reminderForm.notificationMethod === 'both') && (
                        <div className="space-y-2">
                          <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                          <input
                            type="text"
                            id="whatsappNumber"
                            name="whatsappNumber"
                            value={reminderForm.whatsappNumber || ''}
                            onChange={handleReminderFormChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            placeholder="+[Country Code][Number]"
                            required={reminderForm.notificationMethod === 'whatsapp' || reminderForm.notificationMethod === 'both'}
                          />
                        </div>
                      )}

                      <div className="md:col-span-2 pt-4">
                        <button
                          type="submit"
                          className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm hover:shadow-md"
                        >
                          Set Reminder
                        </button>
                      </div>
                    </form>
                  </div>
                </section>

                {/* Auto-Generated Reminders Table */}
                {autoReminders.length > 0 && (
                  <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-lg font-semibold text-gray-900">Auto-Generated Reminders</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Medicine</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dosage</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notify By</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {autoReminders.map((reminder) => (
                            <tr key={reminder._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reminder.medicineName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reminder.dosage}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reminder.time}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{`${reminder.startDate} to ${reminder.endDate}`}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{reminder.notifyBy}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${reminder.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {reminder.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                {/* Uploaded Image Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Original Prescription</h3>
                  </div>
                  <div className="p-4">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={prescription.image}
                        alt="Prescription"
                        className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Extracted Text Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Extracted Text</h3>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {prescription.extractedText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrescriptionViewPage;
