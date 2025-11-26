import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import { Calendar, Pill, FileText, AlertTriangle, Eye } from 'lucide-react';

const HistoryPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrescriptions = async () => {
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
        const res = await API.get('/api/prescriptions', config);
        setPrescriptions(res.data);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError(err.response?.data?.message || 'Failed to fetch prescription history');
        toast.error(err.response?.data?.message || 'Failed to load prescription history');
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading prescription history...</p>
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
      {prescriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">No prescription history available</p>
          <p className="text-gray-400 text-sm">Upload your first prescription to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Prescription Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={prescription.image}
                  alt="Prescription"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full shadow-sm">
                    {new Date(prescription.uploadDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Prescription Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Uploaded {new Date(prescription.uploadDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Pill className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700 font-medium">
                    {prescription.medicines?.length || 0} Medicine{prescription.medicines?.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {prescription.interactions && prescription.interactions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">
                      {prescription.interactions.length} Interaction{prescription.interactions.length !== 1 ? 's' : ''} Detected
                    </span>
                  </div>
                )}

                {/* Medicines Preview */}
                {prescription.medicines && prescription.medicines.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Medicines:</p>
                    <div className="flex flex-wrap gap-1">
                      {prescription.medicines.slice(0, 3).map((med, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {med.name}
                        </span>
                      ))}
                      {prescription.medicines.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{prescription.medicines.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => navigate(`/prescription-view/${prescription._id}`)}
                  className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
