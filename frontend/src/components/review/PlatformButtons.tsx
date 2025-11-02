import React from 'react';
import { ExternalLink, MapPin, Star, ThumbsUp } from 'lucide-react';
import { PlatformButtonsProps, PLATFORM_COLORS } from '../../types';

const PlatformButtons: React.FC<PlatformButtonsProps> = ({
  platforms,
  rating,
  onPlatformClick
}) => {
  const getPlatformIcon = (platformName: string) => {
    const name = platformName.toLowerCase();
    switch (name) {
      case 'google':
      case 'google maps':
        return <MapPin className="h-5 w-5" />;
      case 'yelp':
        return <Star className="h-5 w-5" />;
      case 'facebook':
        return <ThumbsUp className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platformName: string) => {
    const name = platformName.toLowerCase().replace(/\s+/g, '') as keyof typeof PLATFORM_COLORS;
    return PLATFORM_COLORS[name] || PLATFORM_COLORS.default;
  };

  const getPlatformDescription = (platformName: string) => {
    const name = platformName.toLowerCase();
    switch (name) {
      case 'google':
      case 'google maps':
        return 'Help others find this business';
      case 'yelp':
        return 'Share your experience with Yelp community';
      case 'facebook':
        return 'Recommend to your Facebook friends';
      case 'tripadvisor':
        return 'Help travelers make informed decisions';
      default:
        return 'Share your positive experience';
    }
  };

  return (
    <div className="space-y-4">
      {/* Rating Display */}
      <div className="text-center py-2">
        <div className="flex items-center justify-center space-x-1 mb-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={`h-5 w-5 ${
                index < rating 
                  ? 'fill-current text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">
          Your {rating}-star review is ready to share!
        </p>
      </div>

      {/* Platform Buttons */}
      <div className="grid grid-cols-1 gap-3">
        {platforms.map((platform) => {
          const platformColor = getPlatformColor(platform.name);
          const platformIcon = getPlatformIcon(platform.name);
          const description = getPlatformDescription(platform.name);

          return (
            <button
              key={platform.name}
              onClick={() => onPlatformClick(platform)}
              className="group relative flex items-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{
                '--platform-color': platformColor
              } as React.CSSProperties}
            >
              {/* Platform Icon */}
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white mr-4"
                style={{ backgroundColor: platformColor }}
              >
                {platformIcon}
              </div>

              {/* Platform Info */}
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                  Share on {platform.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {description}
                </p>
              </div>

              {/* External Link Icon */}
              <div className="flex-shrink-0 ml-4">
                <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>

              {/* Hover Effect */}
              <div 
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity"
                style={{ backgroundColor: platformColor }}
              />
            </button>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <h4 className="font-semibold text-blue-900 mb-2">
          Why share your review?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Help other customers make informed decisions</li>
          <li>• Support businesses that provide great service</li>
          <li>• Your review will be automatically copied when you click a platform</li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4 text-sm">
        <button className="text-blue-600 hover:text-blue-700 underline">
          Share on all platforms
        </button>
        <span className="text-gray-300">|</span>
        <button className="text-gray-600 hover:text-gray-700 underline">
          Copy review only
        </button>
      </div>

      {/* Platform Stats (Optional) */}
      {platforms.length > 1 && (
        <div className="text-center text-xs text-gray-500 mt-4">
          Sharing on multiple platforms increases visibility by up to 300%
        </div>
      )}
    </div>
  );
};

export default PlatformButtons;