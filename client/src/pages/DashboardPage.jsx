import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import UploadForm from '../components/UploadForm';
import { Clock, TrendingUp, Pill, Calendar as CalendarIcon } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default calendar styles
import '../components/CalendarStyles.css'; // Custom calendar styles

const DashboardPage = ({ toggleSidebar }) => {
  const [userName, setUserName] = useState('');
  const [lastUploadedPrescription, setLastUploadedPrescription] = useState(null);
  const [nextReminder, setNextReminder] = useState(null);
  const [weeklyAdherence, setWeeklyAdherence] = useState(0);
  const [calendarDate, setCalendarDate] = useState(new Date()); // State for calendar's selected date
  const [dailyAdherence, setDailyAdherence] = useState({}); // State for daily adherence data
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
          const now = new Date();
          const currentTime = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
          const currentDate = now.toISOString().split('T')[0];

          // Filter active reminders within date range
          const activeReminders = remindersRes.data.filter(r =>
            r.status === 'active' &&
            r.startDate <= currentDate &&
            r.endDate >= currentDate
          );

          if (activeReminders.length > 0) {
            // Find reminders for today that haven't occurred yet
            const upcomingToday = activeReminders.filter(r => r.time > currentTime);

            if (upcomingToday.length > 0) {
              // Sort by time and get the earliest one today
              upcomingToday.sort((a, b) => a.time.localeCompare(b.time));
              setNextReminder(upcomingToday[0]);
            } else {
              // No more reminders today, show the earliest reminder for tomorrow
              activeReminders.sort((a, b) => a.time.localeCompare(b.time));
              setNextReminder(activeReminders[0]);
            }
          } else {
            setNextReminder(null);
          }
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

        // Fetch daily adherence for the current month
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const dailyAdherenceRes = await API.get(
          `/api/reminders/daily-adherence?startDate=${startOfMonth.toISOString().split('T')[0]}&endDate=${endOfMonth.toISOString().split('T')[0]}`,
          config
        );
        setDailyAdherence(dailyAdherenceRes.data);

      } catch (err) {
        console.error('Error fetching user profile:', err);
        toast.error('Failed to load dashboard data. Please try again.');
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    };
    fetchUserProfile();
  }, []);

  // Effect to re-fetch daily adherence when calendar month changes
  useEffect(() => {
    const fetchDailyAdherenceForMonth = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
          return;
        }
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const startOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
        const endOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);

        const dailyAdherenceRes = await API.get(
          `/api/reminders/daily-adherence?startDate=${startOfMonth.toISOString().split('T')[0]}&endDate=${endOfMonth.toISOString().split('T')[0]}`,
          config
        );
        setDailyAdherence(dailyAdherenceRes.data);
      } catch (err) {
        console.error('Error fetching daily adherence for month:', err);
        toast.error('Failed to load daily adherence data.');
      }
    };

    fetchDailyAdherenceForMonth();
  }, [calendarDate, navigate]); // Re-run when calendarDate changes

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
      '17:00': 'Evening',
      '21:00': 'Night',
    };

    // Convert time to 12-hour format with AM/PM
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
    const formattedTime = `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;

    return timeMap[time] ? `${timeMap[time]}: ${formattedTime}` : formattedTime;
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
                  <span className="font-medium">Time:</span> {getTimeSlotLabel(nextReminder.time)}
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
            <h2 className="text-lg font-semibold text-slate-800">Monthly Adherence</h2>
            <div className="p-2 bg-purple-50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <Calendar
            onChange={setCalendarDate}
            value={calendarDate}
            view="month"
            className="react-calendar-custom"
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const dateString = date.toISOString().split('T')[0];
                const adherenceData = dailyAdherence[dateString];

                if (adherenceData && adherenceData.percentage !== null) {
                  let adherenceClass = '';
                  if (adherenceData.percentage === 100) {
                    adherenceClass = 'adherence-perfect';
                  } else if (adherenceData.percentage >= 50) {
                    adherenceClass = 'adherence-good';
                  } else {
                    adherenceClass = 'adherence-poor';
                  }
                  return (
                    <div className={`adherence-indicator ${adherenceClass}`}>
                      {adherenceData.percentage}%
                    </div>
                  );
                }
              }
              return null;
            }}
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const dateString = date.toISOString().split('T')[0];
                const adherenceData = dailyAdherence[dateString];
                // Only apply class if adherenceData exists AND percentage is not null
                if (adherenceData && adherenceData.percentage !== null) {
                  return 'has-adherence-data';
                }
              }
              return null;
            }}
          />
          {/* Removed original adherence display */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
