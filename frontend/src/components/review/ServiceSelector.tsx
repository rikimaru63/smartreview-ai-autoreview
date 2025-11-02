import React from 'react';
import { Check } from 'lucide-react';
import { ServiceSelectorProps } from '../../types';

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServices,
  onServicesChange,
  disabled = false
}) => {
  const handleServiceToggle = (service: string) => {
    if (disabled) return;

    const updatedServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    onServicesChange(updatedServices);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onServicesChange(services);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onServicesChange([]);
  };

  const isServiceSelected = (service: string) => selectedServices.includes(service);
  const allSelected = selectedServices.length === services.length;
  const noneSelected = selectedServices.length === 0;

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {selectedServices.length} of {services.length} selected
        </span>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            disabled={disabled || allSelected}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleClearAll}
            disabled={disabled || noneSelected}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 gap-3">
        {services.map((service) => {
          const isSelected = isServiceSelected(service);
          
          return (
            <button
              key={service}
              onClick={() => handleServiceToggle(service)}
              disabled={disabled}
              className={`
                flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:shadow-md'
                }
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Checkbox */}
              <div className={`
                flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${isSelected 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-gray-300 bg-white'
                }
              `}>
                {isSelected && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>

              {/* Service Name */}
              <span className={`
                flex-1 text-left font-medium transition-colors
                ${isSelected ? 'text-blue-900' : 'text-gray-700'}
              `}>
                {service}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selection Hint */}
      {selectedServices.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Select the aspects that stood out during your experience
        </div>
      )}

      {/* Selection Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Selected aspects ({selectedServices.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedServices.map((service) => (
              <span
                key={service}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {service}
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceToggle(service);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove ${service}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Tips */}
      {selectedServices.length > 0 && selectedServices.length < 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <strong>Tip:</strong> Selecting 3-5 aspects helps create a more detailed and helpful review.
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;