// Environment configuration with type safety

interface EnvironmentConfig {
  API_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  DEBUG: boolean;
  FEATURES: {
    QR_SCANNING: boolean;
    OFFLINE_MODE: boolean;
    ANALYTICS: boolean;
    ERROR_REPORTING: boolean;
  };
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side environment variables must be prefixed with REACT_APP_
    return (window as any).env?.[key] || import.meta.env?.[`VITE_${key}`] || fallback;
  }
  return fallback;
};

// Environment configuration
export const env: EnvironmentConfig = {
  API_URL: getEnvVar('API_URL', 'http://localhost:8000'),
  APP_NAME: 'SmartReview AI',
  APP_VERSION: getEnvVar('APP_VERSION', '1.0.0'),
  ENVIRONMENT: (getEnvVar('NODE_ENV', 'development') as any) || 'development',
  DEBUG: getEnvVar('DEBUG', 'false') === 'true' || getEnvVar('NODE_ENV', 'development') === 'development',
  FEATURES: {
    QR_SCANNING: getEnvVar('FEATURE_QR_SCANNING', 'true') === 'true',
    OFFLINE_MODE: getEnvVar('FEATURE_OFFLINE_MODE', 'false') === 'true',
    ANALYTICS: getEnvVar('FEATURE_ANALYTICS', 'false') === 'true',
    ERROR_REPORTING: getEnvVar('FEATURE_ERROR_REPORTING', 'false') === 'true',
  }
};

// Development helpers
export const isDevelopment = env.ENVIRONMENT === 'development';
export const isProduction = env.ENVIRONMENT === 'production';
export const isStaging = env.ENVIRONMENT === 'staging';

// Feature flags
export const features = env.FEATURES;

// API configuration
export const apiConfig = {
  baseURL: env.API_URL,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

// App metadata
export const appMetadata = {
  name: env.APP_NAME,
  version: env.APP_VERSION,
  description: 'Generate perfect reviews with AI assistance',
  author: 'SmartReview AI Team',
  repository: 'https://github.com/smartreview-ai/frontend',
  homepage: 'https://smartreview.ai',
  supportEmail: 'support@smartreview.ai',
};

// Log environment configuration in development
if (isDevelopment && env.DEBUG) {
  console.group('🔧 Environment Configuration');
  console.log('Environment:', env.ENVIRONMENT);
  console.log('API URL:', env.API_URL);
  console.log('App Version:', env.APP_VERSION);
  console.log('Features:', env.FEATURES);
  console.log('Debug Mode:', env.DEBUG);
  console.groupEnd();
}

export default env;