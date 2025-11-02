import React from 'react';
import { Star } from 'lucide-react';
import { RatingSelectorProps, RATING_LABELS, RatingValue } from '../../types';

const RatingSelector: React.FC<RatingSelectorProps> = ({
  rating,
  onRatingChange,
  disabled = false
}) => {
  const handleRatingClick = (value: RatingValue) => {
    if (!disabled) {
      onRatingChange(value);
    }
  };

  const getRatingColor = (currentRating: number) => {
    if (currentRating >= 4) return 'text-green-500';
    if (currentRating === 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRatingDescription = (currentRating: number) => {
    if (currentRating === 0) return 'Select a rating';
    return RATING_LABELS[currentRating as RatingValue];
  };

  return (
    <div className="space-y-4">
      {/* Star Rating */}
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRatingClick(value as RatingValue)}
            disabled={disabled}
            className={`
              p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
              ${value <= rating ? 'transform scale-110' : 'hover:bg-gray-50'}
            `}
            aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
          >
            <Star
              className={`h-8 w-8 transition-colors duration-200 ${
                value <= rating 
                  ? 'fill-current text-yellow-400' 
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Rating Label and Description */}
      <div className="text-center space-y-2">
        {rating > 0 && (
          <>
            <div className={`text-2xl font-bold ${getRatingColor(rating)}`}>
              {rating}/5
            </div>
            <div className={`text-lg font-semibold ${getRatingColor(rating)}`}>
              {getRatingDescription(rating)}
            </div>
          </>
        )}
        
        {rating === 0 && (
          <div className="text-gray-500 text-lg">
            {getRatingDescription(rating)}
          </div>
        )}
      </div>

      {/* Rating Guidelines */}
      {rating === 0 && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Rating Guidelines:</h4>
          <ul className="space-y-1">
            <li><span className="font-medium">5 stars:</span> Exceptional experience, exceeded expectations</li>
            <li><span className="font-medium">4 stars:</span> Very good experience, met expectations</li>
            <li><span className="font-medium">3 stars:</span> Good experience, some room for improvement</li>
            <li><span className="font-medium">2 stars:</span> Fair experience, several issues</li>
            <li><span className="font-medium">1 star:</span> Poor experience, significant problems</li>
          </ul>
        </div>
      )}

      {/* Feedback Message Based on Rating */}
      {rating > 0 && (
        <div className={`text-center text-sm p-3 rounded-lg ${
          rating >= 4 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : rating === 3
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {rating >= 4 && (
            "Great! We'll help you share your positive experience."
          )}
          {rating === 3 && (
            "Thanks for your feedback. Let us know what we can improve."
          )}
          {rating <= 2 && (
            "We're sorry your experience wasn't better. Please tell us what went wrong."
          )}
        </div>
      )}
    </div>
  );
};

export default RatingSelector;