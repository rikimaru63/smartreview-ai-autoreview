import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface FeedbackFormProps {
  onSubmit: (data: { feedback: string; contactInfo?: string }) => void;
  isLoading?: boolean;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [feedback, setFeedback] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [errors, setErrors] = useState<{ feedback?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { feedback?: string } = {};
    
    if (!feedback.trim()) {
      newErrors.feedback = 'Please provide feedback about your experience';
    } else if (feedback.trim().length < 10) {
      newErrors.feedback = 'Please provide more detailed feedback (at least 10 characters)';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        feedback: feedback.trim(),
        contactInfo: contactInfo.trim() || undefined
      });
    }
  };

  const handleFeedbackChange = (value: string) => {
    setFeedback(value);
    // Clear error when user starts typing
    if (errors.feedback) {
      setErrors({ ...errors, feedback: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Feedback Textarea */}
      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
          What went wrong with your experience? *
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => handleFeedbackChange(e.target.value)}
          placeholder="Please tell us about the issues you experienced so we can improve..."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.feedback 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500'
          }`}
          rows={4}
          disabled={isLoading}
          maxLength={1000}
        />
        {errors.feedback && (
          <div className="flex items-center space-x-1 mt-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600">{errors.feedback}</p>
          </div>
        )}
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">
            Help us understand what we can improve
          </p>
          <p className="text-xs text-gray-500">
            {feedback.length}/1000
          </p>
        </div>
      </div>

      {/* Contact Info (Optional) */}
      <div>
        <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
          Contact Information (Optional)
        </label>
        <input
          id="contactInfo"
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Email or phone number if you'd like us to follow up"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">
          We may contact you to better understand your feedback and make improvements
        </p>
      </div>

      {/* Feedback Categories (Quick Selection) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Common Issues (Select to add to your feedback)
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            'Slow service',
            'Poor food quality',
            'Unfriendly staff',
            'Cleanliness issues',
            'Long wait times',
            'Incorrect order',
            'Overpriced',
            'Noisy environment'
          ].map((issue) => (
            <button
              key={issue}
              type="button"
              onClick={() => {
                const currentFeedback = feedback.trim();
                const newFeedback = currentFeedback 
                  ? `${currentFeedback} ${issue}.`
                  : `${issue}.`;
                setFeedback(newFeedback);
              }}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              + {issue}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={isLoading || !feedback.trim()}
          className="flex items-center space-x-2 bg-yellow-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Feedback</span>
            </>
          )}
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
        <p>
          <strong>Privacy:</strong> Your feedback helps us improve our service. 
          We'll only use your contact information to follow up on your specific concerns. 
          We never share personal information with third parties.
        </p>
      </div>
    </form>
  );
};

export default FeedbackForm;