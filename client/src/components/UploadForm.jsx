import React, { useState } from 'react';
import API from '../services/api';

const UploadForm = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file first.');
      return;
    }

    setLoading(true);
    setMessage('Please wait… Analysing your prescription');
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const res = await API.post('/api/prescriptions/upload', formData, config);
      setMessage('Prescription uploaded and analyzed successfully!');
      setSelectedFile(null);
      if (onUploadSuccess) {
        // Pass the new prescription ID to the callback
        const newPrescriptionId = res.data.prescription._id;
        localStorage.setItem('lastUploadedPrescription', JSON.stringify({
          id: newPrescriptionId,
          timestamp: new Date().toISOString(),
        }));
        onUploadSuccess(newPrescriptionId);
      }
    } catch (err) {
      console.error('Error uploading prescription:', err);
      setError(err.response?.data?.message || 'Failed to upload prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">Upload Prescription Image</h3>
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 disabled:opacity-50"
      >
        {loading ? 'Uploading...' : '+ Add Prescription'}
      </button>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {loading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <p className="text-lg font-semibold">Please wait… Analysing your prescription</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
