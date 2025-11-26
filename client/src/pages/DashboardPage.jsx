import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import UploadForm from '../components/UploadForm';
import { Clock, TrendingUp, Pill } from 'lucide-react';

const DashboardPage = ({ toggleSidebar }) => {
  const [userName, setUserName] = useState('');
  const [lastUploadedPrescription, setLastUploadedPrescription] = useState(null);
  const [nextReminder, setNextReminder] = useState(null);
  const [weeklyAdherence, setWeeklyAdherence] = useState(0);
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

        // Fetch next upcoming reminder
        const remindersRes = await API.get('/api/reminders', config);
        if (remindersRes.data.length > 0) {
          // Find the next reminder based on time
          const now = new Date();
          const currentTime = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
          const currentDate = now.toISOString().split('T')[0];

          // Filter active reminders that are today or in the future
          const upcomingReminders = remindersRes.data.filter(r =>
            r.status === 'active' && r.endDate >= currentDate
          );

          // Sort by time to find the next one
          const sortedReminders = upcomingReminders.sort((a, b) => {
            if (a.time < b.time) return -1;
            if (a.time > b.time) return 1;
            return 0;
          });

          // Find next reminder after current time
          const nextReminderToday = sortedReminders.find(r => r.time > currentTime);
          setNextReminder(nextReminderToday || sortedReminders[0]);
        }

        // Fetch reminder history for weekly adherence
        const historyRes = await API.get('/api/reminders/history', config);
        if (historyRes.data.length > 0) {
          // Calculate adherence for the last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const weekHistory = historyRes.data.filter(h =>
            new Date(h.triggerDate) >= sevenDaysAgo
          );

          if (weekHistory.length > 0) {
            const takenCount = weekHistory.filter(h => h.status === 'taken').length;
            const adherencePercentage = Math.round((takenCount / weekHistory.length) * 100);
            setWeeklyAdherence(adherencePercentage);
          } else {
            setWeeklyAdherence(100); // Default to 100% if no history
          }
        } else {
          setWeeklyAdherence(100); // Default to 100% if no history
        }

      } catch (err) {
        console.error('Error fetching user profile:', err);
        toast.error('Failed to load dashboard data. Please try again.');
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

  const getTimeSlotLabel = (time) => {
    const timeMap = {
      '08:00': 'Morning',
      '13:00': 'Afternoon',
      '18:00': 'Evening',
      '21:00': 'Night',
    };
    return timeMap[time] || time;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          {lastUploadedPrescription ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Last Prescription</h2>
                <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                  Uploaded
                </span>
              </div>
              <p className="text-slate-600 mb-6 text-sm">
                Date: {new Date(lastUploadedPrescription.timestamp).toLocaleDateString()}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleViewLastPrescription}
                  className="w-full px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={handleAddAnotherPrescription}
                  className="w-full px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  Upload New
                </button>
              </div>
            </div>
          ) : (
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          )}
        </div>

        {/* Next Reminder Widget */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Next Reminder</h2>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          {nextReminder ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-slate-400" />
                <p className="font-medium text-slate-900">{nextReminder.medicineName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Time:</span> {getTimeSlotLabel(nextReminder.time)} ({nextReminder.time})
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Dosage:</span> {nextReminder.dosage}
                </p>
              </div>
              <button
                onClick={() => navigate('/reminders')}
                className="w-full mt-4 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                View All Reminders
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">No upcoming reminders</p>
              <button
                onClick={() => navigate('/history')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Upload a prescription to set reminders
              </button>
            </div>
          )}
        </div>

        {/* Weekly Adherence Widget */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Weekly Adherence</h2>
            <div className={`p-2 rounded-lg ${weeklyAdherence >= 80 ? 'bg-green-50' :
              weeklyAdherence >= 50 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
              <TrendingUp className={`w-5 h-5 ${weeklyAdherence >= 80 ? 'text-green-600' :
                weeklyAdherence >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`} />
            </div>
          </div>
          <div className="text-center py-2">
            <p className={`text-4xl font-bold mb-2 ${weeklyAdherence >= 80 ? 'text-green-600' :
              weeklyAdherence >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
              {weeklyAdherence}%
            </p>
            <p className="text-sm text-slate-500">Last 7 days</p>
            {weeklyAdherence >= 80 && (
              <p className="text-xs text-green-600 mt-2">Great job! Keep it up! 🎉</p>
            )}
            {weeklyAdherence >= 50 && weeklyAdherence < 80 && (
              <p className="text-xs text-yellow-600 mt-2">Good, but you can do better!</p>
            )}
            {weeklyAdherence < 50 && (
              <p className="text-xs text-red-600 mt-2">Try to improve your adherence</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
