// Review types
export interface ReviewData {
  store_id: string;
  rating: number;
  services: string[];
  customer_feedback?: string;
}

export interface GeneratedReview {
  id: string;
  review_text: string;
  rating: number;
  store_id: string;
  created_at: string;
  metadata?: {
    services: string[];
    word_count: number;
    tone: string;
  };
}

// Store types
export interface Store {
  id: string;
  name: string;
  description?: string;
  category: string;
  location?: string;
  contact_info?: ContactInfo;
  services: string[];
  platforms: ReviewPlatform[];
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

// Platform types
export interface ReviewPlatform {
  name: string;
  url: string;
  icon?: string;
  color?: string;
}

// Feedback types
export interface FeedbackData {
  store_id: string;
  rating: number;
  feedback: string;
  contact_info?: string;
}

export interface FeedbackResponse {
  id: string;
  message: string;
  status: 'submitted' | 'processed';
  created_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Component prop types
export interface RatingSelectorProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

export interface ServiceSelectorProps {
  services: string[];
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  disabled?: boolean;
}

export interface ReviewDisplayProps {
  review: GeneratedReview;
  onCopy?: () => void;
  onEdit?: () => void;
}

export interface PlatformButtonsProps {
  platforms: ReviewPlatform[];
  rating: number;
  onPlatformClick: (platform: ReviewPlatform) => void;
}

// Form types
export interface ReviewFormData {
  rating: number;
  services: string[];
  customerFeedback?: string;
}

export interface FeedbackFormData {
  feedback: string;
  contactInfo?: string;
}

// QR Code types
export interface QRCodeData {
  store_id: string;
  url: string;
}

// App state types
export interface AppState {
  currentStore: Store | null;
  currentReview: GeneratedReview | null;
  isLoading: boolean;
  error: string | null;
}

// Hook types
export interface UseReviewGeneration {
  generateReview: (data: ReviewData) => Promise<GeneratedReview>;
  isLoading: boolean;
  error: string | null;
}

export interface UseStoreData {
  store: Store | null;
  isLoading: boolean;
  error: string | null;
  fetchStore: (storeId: string) => Promise<void>;
}

// Constants
export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair', 
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
} as const;

export const PLATFORM_COLORS = {
  google: '#4285F4',
  yelp: '#FF1A1A',
  facebook: '#1877F2',
  tripadvisor: '#00AA6C',
  default: '#6B7280'
} as const;

export type RatingValue = 1 | 2 | 3 | 4 | 5;
export type PlatformName = keyof typeof PLATFORM_COLORS;