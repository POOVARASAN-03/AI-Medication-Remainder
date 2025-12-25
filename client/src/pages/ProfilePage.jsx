import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import API from '../services/api';

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        // Get user info from localStorage
        const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        setUserInfo(storedUserInfo);

        // Fetch user's prescriptions
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const response = await API.get('/api/prescriptions');

            // Sort by upload date (most recent first) and take last 5
            const sortedPrescriptions = response.data.sort((a, b) =>
                new Date(b.uploadDate) - new Date(a.uploadDate)
            ).slice(0, 5);
            setPrescriptions(sortedPrescriptions);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            toast.error('Error loading prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="w-10 h-10 text-primary-700" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-slate-900">
                                {userInfo?.name || 'User'}
                            </h2>
                            <div className="flex items-center gap-2 mt-1 text-slate-600">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">{userInfo?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Last Uploaded Prescriptions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-xl font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-600" />
                        Recent Prescriptions
                    </h3>

                    {prescriptions.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No prescriptions uploaded yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {prescriptions.map((prescription, index) => (
                                <motion.div
                                    key={prescription._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer"
                                    onClick={() => navigate(`/reminders/${prescription._id}`)} // Add onClick handler
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {prescription.name || `Prescription #${prescriptions.length - index}`}
                                            </p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(prescription.uploadDate)}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(prescription.uploadDate)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {prescription.medicines && prescription.medicines.length > 0 && (
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-primary-600">
                                                {prescription.medicines.length} {prescription.medicines.length === 1 ? 'Medicine' : 'Medicines'}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
