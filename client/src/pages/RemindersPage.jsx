import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import { Bell, Clock, Calendar, Pill, Mail, MessageSquare, CheckCircle, ChevronRight } from 'lucide-react';

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
        toast.error(err.response?.data?.message || 'Failed to load reminders');
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

  const getNotificationIcon = (method) => {
    switch (method) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'both':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimeTo12Hour = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const getTimeSlotLabel = (time) => {
    const timeMap = {
      '08:00': 'Morning',
      '13:00': 'Afternoon',
      '18:00': 'Evening',
      '21:00': 'Night',
    };
    return timeMap[time] || formatTimeTo12Hour(time);
  };

  const groupedReminders = reminders.reduce((acc, reminder) => {
    const prescriptionName = reminder.prescription?.name || 'Unknown Prescription';
    const prescriptionId = reminder.prescription?._id;
    const prescriptionImage = reminder.prescription?.image;

    if (!acc[prescriptionName]) {
      acc[prescriptionName] = {
        id: prescriptionId, // Store the ID with the group
        reminders: [],
        image: prescriptionImage // Store image if available
      };
    }
    acc[prescriptionName].reminders.push(reminder);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading reminders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {reminders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
              <p className="text-sm text-gray-500">Total Reminders</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {reminders.filter(r => r.status === 'active').length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Pill className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(reminders.map(r => r.medicineName)).size}
              </p>
              <p className="text-sm text-gray-500">Unique Medicines</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Prescriptions with Reminders</h2>

      {Object.keys(groupedReminders).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">No active reminders</p>
          <p className="text-gray-400 text-sm">Upload a prescription to create reminders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedReminders).map(([prescriptionName, groupedData]) => {
            const activeRemindersCount = groupedData.reminders.filter(r => r.status === 'active').length;
            const prescriptionId = groupedData.id;
            const prescriptionImage = groupedData.image;

            // Only render if we have a valid prescriptionId (not undefined, null, or the string "undefined")
            if (!prescriptionId || prescriptionId === 'undefined') return null;

            return (
              <div
                key={prescriptionName}
                onClick={() => navigate(`/reminders/${prescriptionId}`)} // Use the stored ID
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-4 flex items-center gap-4">
                  {prescriptionImage ? (
                    <img
                      src={prescriptionImage}
                      alt={prescriptionName}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Pill className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">
                      {prescriptionName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {activeRemindersCount} active reminder{activeRemindersCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
