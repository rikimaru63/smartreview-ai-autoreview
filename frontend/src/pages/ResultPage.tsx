import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewDisplay from '../components/review/ReviewDisplay';
import PlatformButtons from '../components/review/PlatformButtons';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { GeneratedReview, Store } from '../types';

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [review, setReview] = useState<GeneratedReview | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get stored data from ReviewPage
    const storedReview = sessionStorage.getItem('generatedReview');
    const storedStore = sessionStorage.getItem('reviewStore');

    if (storedReview && storedStore) {
      try {
        setReview(JSON.parse(storedReview));
        setStore(JSON.parse(storedStore));
      } catch (error) {
        console.error('Failed to parse stored data:', error);
        toast.error('Failed to load review data');
        navigate('/review');
      }
    } else {
      // No data found, redirect to review page
      toast.error('No review data found');
      navigate('/review');
    }

    setIsLoading(false);
  }, [navigate]);

  const handleCopyReview = () => {
    if (review) {
      navigator.clipboard.writeText(review.review_text).then(() => {
        toast.success('Review copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy review');
      });
    }
  };

  const handleEditReview = () => {
    // For MVP, just go back to review page
    // In future versions, could implement inline editing
    navigate('/review');
  };

  const handlePlatformClick = (platform: { name: string; url: string }) => {
    // Open platform URL in new tab/window
    window.open(platform.url, '_blank');
    
    // Auto-copy review to clipboard for convenience
    if (review) {
      navigator.clipboard.writeText(review.review_text).then(() => {
        toast.success(`Review copied! Opening ${platform.name}...`);
      }).catch(() => {
        toast.success(`Opening ${platform.name}...`);
      });
    }
  };

  const handleStartOver = () => {
    // Clear session storage and go back to review page
    sessionStorage.removeItem('generatedReview');
    sessionStorage.removeItem('reviewStore');
    navigate('/review');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!review || !store) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No review data found</p>
        <button
          onClick={() => navigate('/review')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Start New Review
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/review')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleStartOver}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Start Over</span>
        </button>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Review for {store.name}
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Rating: {review.rating}/5 stars</span>
          {review.metadata?.word_count && (
            <span>Words: {review.metadata.word_count}</span>
          )}
          {review.metadata?.tone && (
            <span>Tone: {review.metadata.tone}</span>
          )}
        </div>
      </div>

      {/* Generated Review */}
      <ReviewDisplay
        review={review}
        onCopy={handleCopyReview}
        onEdit={handleEditReview}
      />

      {/* Platform Buttons for High Ratings */}
      {review.rating >= 4 && store.platforms.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Share your review on these platforms:
          </h3>
          <PlatformButtons
            platforms={store.platforms}
            rating={review.rating}
            onPlatformClick={handlePlatformClick}
          />
          <p className="text-xs text-gray-500 mt-4 text-center">
            Your review will be automatically copied when you click a platform
          </p>
        </div>
      )}

      {/* Thank You Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Thank You for Your Review!
        </h3>
        <p className="text-green-700 text-sm">
          {review.rating >= 4 
            ? 'Your positive feedback helps other customers and supports our business.'
            : 'Thank you for your feedback. We\'ll use it to improve our service.'
          }
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-3">
        <button
          onClick={handleStartOver}
          className="w-full bg-gray-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Create Another Review
        </button>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 rounded-lg p-4 text-xs">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <pre className="text-gray-600 overflow-x-auto">
            {JSON.stringify({ 
              reviewId: review.id,
              storeId: store.id,
              services: review.metadata?.services 
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ResultPage;