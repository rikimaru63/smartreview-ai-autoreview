import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Star, ArrowRight, AlertCircle } from 'lucide-react';
import RatingSelector from '../components/review/RatingSelector';
import ServiceSelector from '../components/review/ServiceSelector';
import FeedbackForm from '../components/feedback/FeedbackForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { ReviewData, Store, RatingValue } from '../types';

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('store_id') || 'demo-store-001';

  const [rating, setRating] = useState<RatingValue | 0>(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [store, setStore] = useState<Store | null>(null);

  // Mock store data for demo
  const mockStore: Store = {
    id: storeId,
    name: 'Demo Restaurant',
    description: 'A wonderful dining experience',
    category: 'Restaurant',
    location: 'Tokyo, Japan',
    services: [
      'Food Quality',
      'Service Speed',
      'Staff Friendliness',
      'Atmosphere',
      'Cleanliness',
      'Value for Money'
    ],
    platforms: [
      { name: 'Google', url: 'https://maps.google.com', color: '#4285F4' },
      { name: 'Yelp', url: 'https://yelp.com', color: '#FF1A1A' },
      { name: 'Facebook', url: 'https://facebook.com', color: '#1877F2' }
    ]
  };

  // Generate review mutation
  const generateReviewMutation = useMutation({
    mutationFn: (data: ReviewData) => apiService.generateReview(data),
    onSuccess: (response) => {
      // Store the generated review in session storage for ResultPage
      sessionStorage.setItem('generatedReview', JSON.stringify(response.data));
      sessionStorage.setItem('reviewStore', JSON.stringify(store));
      navigate('/result');
    },
    onError: (error: any) => {
      console.error('Review generation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to generate review');
    }
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: (data: { store_id: string; rating: number; feedback: string; contact_info?: string }) => 
      apiService.submitFeedback(data),
    onSuccess: () => {
      toast.success('Thank you for your feedback! We\'ll work on improving your experience.');
      setShowFeedbackForm(false);
      // Reset form
      setRating(0);
      setSelectedServices([]);
      setCustomerFeedback('');
    },
    onError: (error: any) => {
      console.error('Feedback submission failed:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  });

  useEffect(() => {
    // In a real app, fetch store data from API
    setStore(mockStore);
  }, [storeId]);

  const handleRatingChange = (newRating: RatingValue) => {
    setRating(newRating);
    
    // Show feedback form for ratings 1-3
    if (newRating <= 3) {
      setShowFeedbackForm(true);
    } else {
      setShowFeedbackForm(false);
    }
  };

  const handleGenerateReview = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (selectedServices.length === 0) {
      toast.error('Please select at least one service aspect');
      return;
    }

    const reviewData: ReviewData = {
      store_id: storeId,
      rating: rating as RatingValue,
      services: selectedServices,
      customer_feedback: customerFeedback || undefined
    };

    generateReviewMutation.mutate(reviewData);
  };

  const handleFeedbackSubmit = (feedbackData: { feedback: string; contactInfo?: string }) => {
    submitFeedbackMutation.mutate({
      store_id: storeId,
      rating: rating as RatingValue,
      feedback: feedbackData.feedback,
      contact_info: feedbackData.contactInfo
    });
  };

  if (!store) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Store Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h2>
        {store.description && (
          <p className="text-gray-600 mb-2">{store.description}</p>
        )}
        {store.location && (
          <p className="text-sm text-gray-500">{store.location}</p>
        )}
      </div>

      {/* Rating Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How would you rate your experience?
        </h3>
        <RatingSelector
          rating={rating}
          onRatingChange={handleRatingChange}
          disabled={generateReviewMutation.isPending || submitFeedbackMutation.isPending}
        />
      </div>

      {/* Service Selection */}
      {rating > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Which aspects stood out to you?
          </h3>
          <ServiceSelector
            services={store.services}
            selectedServices={selectedServices}
            onServicesChange={setSelectedServices}
            disabled={generateReviewMutation.isPending || submitFeedbackMutation.isPending}
          />
        </div>
      )}

      {/* Additional Feedback for High Ratings */}
      {rating >= 4 && selectedServices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Any specific comments? (Optional)
          </h3>
          <textarea
            value={customerFeedback}
            onChange={(e) => setCustomerFeedback(e.target.value)}
            placeholder="Tell us what made your experience special..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            disabled={generateReviewMutation.isPending}
          />
        </div>
      )}

      {/* Feedback Form for Low Ratings */}
      {showFeedbackForm && rating <= 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">
                We'd like to improve your experience
              </h3>
              <p className="text-yellow-700 text-sm mt-1">
                Please let us know what went wrong so we can make it better.
              </p>
            </div>
          </div>
          <FeedbackForm
            onSubmit={handleFeedbackSubmit}
            isLoading={submitFeedbackMutation.isPending}
          />
        </div>
      )}

      {/* Generate Review Button */}
      {rating >= 4 && selectedServices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={handleGenerateReview}
            disabled={generateReviewMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generateReviewMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating Review...</span>
              </>
            ) : (
              <>
                <span>Generate AI Review</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            We'll create a helpful review based on your experience
          </p>
        </div>
      )}

      {/* Demo QR Link */}
      <div className="text-center">
        <button
          onClick={() => navigate('/qr-simulator')}
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Test QR Code Scanner (Demo)
        </button>
      </div>
    </div>
  );
};

export default ReviewPage;