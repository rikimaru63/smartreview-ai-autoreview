import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Scan, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QRSimulator: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  // Mock QR codes for testing
  const mockQRCodes = [
    {
      id: 'demo-restaurant-001',
      name: 'Demo Restaurant',
      category: 'Restaurant',
      location: 'Tokyo, Japan',
      qrData: 'smartreview://review?store_id=demo-restaurant-001'
    },
    {
      id: 'demo-cafe-002',
      name: 'Cozy Cafe',
      category: 'Cafe',
      location: 'Shibuya, Tokyo',
      qrData: 'smartreview://review?store_id=demo-cafe-002'
    },
    {
      id: 'demo-hotel-003',
      name: 'Grand Hotel',
      category: 'Hotel',
      location: 'Ginza, Tokyo',
      qrData: 'smartreview://review?store_id=demo-hotel-003'
    }
  ];

  const handleScanStart = () => {
    setIsScanning(true);
    setScannedData(null);
    
    // Simulate scanning delay
    setTimeout(() => {
      // Randomly select a mock QR code
      const randomQR = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
      setScannedData(randomQR.qrData);
      setIsScanning(false);
      toast.success(`QR Code scanned: ${randomQR.name}`);
    }, 2000);
  };

  const handleUseScannedData = () => {
    if (scannedData) {
      // Parse store_id from QR data
      const url = new URL(scannedData.replace('smartreview://', 'https://'));
      const storeId = url.searchParams.get('store_id');
      
      if (storeId) {
        navigate(`/review?store_id=${storeId}`);
      } else {
        toast.error('Invalid QR code data');
      }
    }
  };

  const handleManualStoreSelect = (storeId: string) => {
    navigate(`/review?store_id=${storeId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/review')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Review</span>
        </button>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Scanner</h2>
        <p className="text-gray-600">
          Scan a QR code to start reviewing a business
        </p>
      </div>

      {/* Scanner Simulation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center space-y-4">
          {/* Scanner Display */}
          <div className={`
            relative w-64 h-64 mx-auto border-4 rounded-lg overflow-hidden
            ${isScanning ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          `}>
            {!isScanning && !scannedData && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    Tap "Start Scanning" to begin
                  </p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Scan className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-blue-600 text-sm font-medium">
                    Scanning...
                  </p>
                  {/* Scanning animation */}
                  <div className="absolute inset-4 border-2 border-blue-500 rounded-lg">
                    <div className="w-full h-1 bg-blue-500 animate-ping absolute top-1/2"></div>
                  </div>
                </div>
              </div>
            )}

            {scannedData && (
              <div className="flex items-center justify-center h-full bg-green-50">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-green-600 text-sm font-medium">
                    QR Code Detected!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scanner Controls */}
          <div className="space-y-3">
            {!isScanning && !scannedData && (
              <button
                onClick={handleScanStart}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Start Scanning
              </button>
            )}

            {scannedData && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium mb-1">
                    Scanned Successfully!
                  </p>
                  <p className="text-green-700 text-xs break-all">
                    {scannedData}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleUseScannedData}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Start Review
                  </button>
                  <button
                    onClick={() => {
                      setScannedData(null);
                      setIsScanning(false);
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Scan Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Store Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Or choose a demo store:
        </h3>
        <div className="space-y-3">
          {mockQRCodes.map((store) => (
            <button
              key={store.id}
              onClick={() => handleManualStoreSelect(store.id)}
              className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{store.name}</h4>
                  <p className="text-sm text-gray-600">{store.category}</p>
                  <p className="text-xs text-gray-500">{store.location}</p>
                </div>
                <QrCode className="h-6 w-6 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
        <ul className="text-sm text-blue-800 text-left space-y-1">
          <li>1. Scan the QR code displayed at the business</li>
          <li>2. Rate your experience (1-5 stars)</li>
          <li>3. Select which services stood out</li>
          <li>4. Get an AI-generated review</li>
          <li>5. Share on your favorite platforms</li>
        </ul>
      </div>
    </div>
  );
};

export default QRSimulator;