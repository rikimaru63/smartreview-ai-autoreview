import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ReviewPage from './pages/ReviewPage';
import ResultPage from './pages/ResultPage';
import QRSimulator from './components/common/QRSimulator';
import './styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-md mx-auto px-4 py-3">
              <h1 className="text-xl font-bold text-gray-900 text-center">
                SmartReview AI
              </h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-md mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/review" replace />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/qr-simulator" element={<QRSimulator />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t mt-8">
            <div className="max-w-md mx-auto px-4 py-4 text-center text-sm text-gray-500">
              <p>&copy; 2024 SmartReview AI. All rights reserved.</p>
            </div>
          </footer>
        </div>

        {/* Toast notifications */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;