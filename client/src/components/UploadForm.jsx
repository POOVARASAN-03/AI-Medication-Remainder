import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import API from '../services/api';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

const UploadForm = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prescriptionName, setPrescriptionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast.error('Please drop an image file.');
      }
    }
  };

  // Effect to attach stream to video element when it becomes available
  React.useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, showCamera]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please ensure you have granted permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "camera-capture.png", { type: "image/png" });
        setSelectedFile(file);
        stopCamera();
      }, 'image/png');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image file first.');
      return;
    }

    if (!prescriptionName.trim()) {
      toast.error('Please enter a prescription name.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('prescriptionName', prescriptionName);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const res = await API.post('/api/prescriptions/upload', formData, config);
      toast.success('Prescription uploaded and analyzed successfully!', { id: 'upload' });
      setSelectedFile(null);
      if (onUploadSuccess) {
        const newPrescriptionId = res.data.prescription._id;
        localStorage.setItem('lastUploadedPrescription', JSON.stringify({
          id: newPrescriptionId,
          timestamp: new Date().toISOString(),
        }));
        onUploadSuccess(newPrescriptionId);
      }
    } catch (err) {
      console.error('Error uploading prescription:', err);
      toast.error(err.response?.data?.message || 'Failed to upload prescription.', { id: 'upload' });
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6 transition-all duration-300 hover:shadow-xl border border-gray-100">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Upload className="w-6 h-6 text-blue-600" />
        Upload Prescription
      </h3>

      <div className="mb-4">
        <label htmlFor="prescriptionName" className="block text-sm font-medium text-gray-700 mb-2">
          Prescription Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="prescriptionName"
          value={prescriptionName}
          onChange={(e) => setPrescriptionName(e.target.value)}
          placeholder="e.g., Blood Pressure Meds, Antibiotics"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      {!showCamera ? (
        <div className="space-y-6">
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    Drag & Drop your prescription here
                  </p>
                  <p className="text-sm text-gray-500">OR</p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 w-full max-w-md">
                  <label className="flex-1 min-w-[140px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                      <ImageIcon className="w-4 h-4" />
                      Browse Files
                    </div>
                  </label>

                  <button
                    onClick={startCamera}
                    className="flex-1 min-w-[140px] px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    Use Camera
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload & Analyze
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={captureImage}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Capture
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}



      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 animate-scale-in">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Analyzing Prescription</h4>
            <p className="text-gray-500 text-center">
              Please wait while our AI extracts the medication details...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
