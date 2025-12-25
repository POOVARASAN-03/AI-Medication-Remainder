import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import MedicineTable from '../components/MedicineTable';
import { Calendar, Clock, Bell, FileText, Image as ImageIcon, ArrowLeft, CheckSquare, Square } from 'lucide-react';

// Helper function to parse frequency string (e.g., "1-0-1") into time slots
const parseFrequency = (frequency) => {
  if (!frequency) return [];

  const parts = frequency.toLowerCase().split('-').map(p => p.trim());
  const times = [];

  // Map positions to times: Morning (08:00), Afternoon (13:00), Night (20:30)
  if (parts[0] && parts[0] !== '0') times.push('08:00'); // Morning
  if (parts[1] && parts[1] !== '0') times.push('13:00'); // Afternoon
  if (parts[2] && parts[2] !== '0') times.push('20:30'); // Night

  return times;
};

const PrescriptionViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [activeReminders, setActiveReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batchConfig, setBatchConfig] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({
    startDate: '',
    endDate: '',
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
        setActiveReminders(remindersRes.data);

        // Initialize batch config with all medicines selected and times parsed from frequency
        const today = new Date().toISOString().split('T')[0];
        const defaultEndDate = new Date();
        defaultEndDate.setDate(defaultEndDate.getDate() + 30);

        setGlobalSettings({
          startDate: today,
          endDate: defaultEndDate.toISOString().split('T')[0],
        });

        const initialConfig = prescriptionRes.data.medicines.map(med => ({
          medicineName: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          selected: true,
          times: parseFrequency(med.frequency),
        }));

        setBatchConfig(initialConfig);

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

  const toggleMedicineSelection = (index) => {
    setBatchConfig(prev => prev.map((item, i) =>
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const updateMedicineTime = (medIndex, timeIndex, newTime) => {
    setBatchConfig(prev => prev.map((item, i) => {
      if (i === medIndex) {
        const newTimes = [...item.times];
        newTimes[timeIndex] = newTime;
        return { ...item, times: newTimes };
      }
      return item;
    }));
  };

  const handleBatchSetReminders = async () => {
    const selectedMeds = batchConfig.filter(item => item.selected && item.times.length > 0);

    if (selectedMeds.length === 0) {
      toast.error('Please select at least one medicine with a time slot');
      return;
    }

    setBatchLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json',
        },
      };

      // Build reminders array
      const reminders = [];
      selectedMeds.forEach(med => {
        med.times.forEach(time => {
          reminders.push({
            prescription: id,
            medicineName: med.medicineName,
            time: time,
            startDate: globalSettings.startDate,
            endDate: globalSettings.endDate,
          });
        });
      });

      const res = await API.post('/api/reminders/batch', { reminders }, config);
      toast.success(res.data.message || 'Reminders created successfully!');

      // Refresh reminders list
      const remindersRes = await API.get(`/api/reminders?prescriptionId=${id}`, config);
      setActiveReminders(remindersRes.data);

    } catch (err) {
      console.error('Error setting batch reminders:', err);
      toast.error(err.response?.data?.message || 'Failed to set reminders');
    } finally {
      setBatchLoading(false);
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Content Column */}
              <div className="xl:col-span-2 space-y-6 lg:space-y-8">

                {/* Medicines Table Section */}
                <section>
                  <MedicineTable medicines={prescription.medicines} interactions={prescription.interactions} />
                </section>

                {/* Batch Reminder Setup Section */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Batch Reminder Setup</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Configure reminders for all medicines at once</p>
                  </div>

                  <div className="p-4 sm:p-6 space-y-6">
                    {/* Global Settings */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h3 className="font-medium text-gray-900 text-sm">Global Settings</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Start Date</label>
                          <input
                            type="date"
                            value={globalSettings.startDate}
                            onChange={(e) => setGlobalSettings(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">End Date</label>
                          <input
                            type="date"
                            value={globalSettings.endDate}
                            onChange={(e) => setGlobalSettings(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                          />
                        </div>

                      </div>
                    </div>

                    {/* Medicine List */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 text-sm">Select Medicines & Times</h3>
                      {batchConfig.map((med, medIndex) => (
                        <div key={medIndex} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleMedicineSelection(medIndex)}
                              className="mt-1 flex-shrink-0 text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {med.selected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">{med.medicineName}</h4>
                                  <p className="text-xs text-gray-500">{med.dosage} • {med.frequency}</p>
                                </div>
                              </div>
                              {med.selected && (
                                <div className="flex flex-wrap gap-2">
                                  {med.times.map((time, timeIndex) => (
                                    <input
                                      key={timeIndex}
                                      type="time"
                                      value={time}
                                      onChange={(e) => updateMedicineTime(medIndex, timeIndex, e.target.value)}
                                      className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm font-medium text-blue-900"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleBatchSetReminders}
                      disabled={batchLoading}
                      className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {batchLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Setting Reminders...
                        </>
                      ) : (
                        <>
                          <Bell className="w-5 h-5" />
                          Set All Reminders
                        </>
                      )}
                    </button>
                  </div>
                </section>

                {/* Active Reminders Table */}
                {activeReminders.length > 0 && (
                  <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-lg font-semibold text-gray-900">Active Reminders</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Medicine</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dosage</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Duration</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeReminders.map((reminder) => (
                            <tr key={reminder._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900">{reminder.medicineName}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">{reminder.dosage}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 font-medium">{reminder.time}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">{`${reminder.startDate} to ${reminder.endDate}`}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
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
