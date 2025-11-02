import React, { useState } from 'react';
import { Copy, Check, Edit3, Star } from 'lucide-react';
import { ReviewDisplayProps } from '../../types';

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  review,
  onCopy,
  onEdit
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Just now';
    }
  };

  const getStarsDisplay = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? 'fill-current text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getCharacterCount = (text: string) => {
    // Count characters and estimate platform limits
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    return { charCount, wordCount };
  };

  const { charCount, wordCount } = getCharacterCount(review.review_text);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              {getStarsDisplay(review.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {review.rating}/5 stars
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Edit review"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
            <button
              onClick={handleCopy}
              className={`inline-flex items-center px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                isCopied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
              }`}
              title="Copy review to clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="p-6">
        <div className="prose prose-sm max-w-none">
          <div 
            className="text-gray-800 leading-relaxed whitespace-pre-line break-words"
            style={{ fontSize: '15px', lineHeight: '1.6' }}
          >
            {review.review_text}
          </div>
        </div>
      </div>

      {/* Footer with Metadata */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              <strong>{charCount}</strong> characters
            </span>
            <span>
              <strong>{wordCount}</strong> words
            </span>
            {review.metadata?.tone && (
              <span>
                Tone: <strong className="capitalize">{review.metadata.tone}</strong>
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Generated {formatDate(review.created_at)}
          </div>
        </div>

        {/* Platform Character Limits Info */}
        <div className="mt-3 text-xs text-gray-500">
          <div className="flex flex-wrap gap-4">
            <span className={charCount <= 280 ? 'text-green-600' : 'text-red-600'}>
              Twitter: {charCount}/280
            </span>
            <span className={charCount <= 63206 ? 'text-green-600' : 'text-red-600'}>
              Google: {charCount}/63,206
            </span>
            <span className={charCount <= 5000 ? 'text-green-600' : 'text-red-600'}>
              Yelp: {charCount}/5,000
            </span>
            <span className={charCount <= 8000 ? 'text-green-600' : 'text-red-600'}>
              Facebook: {charCount}/8,000
            </span>
          </div>
        </div>

        {/* Services Mentioned */}
        {review.metadata?.services && review.metadata.services.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Aspects covered:</div>
            <div className="flex flex-wrap gap-1">
              {review.metadata.services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDisplay;