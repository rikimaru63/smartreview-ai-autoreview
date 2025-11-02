import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Handles conflicts and overrides properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to human-readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  return dateObj.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateObj);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate a random ID
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Sanitize HTML string (basic)
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Calculate text statistics
 */
export function getTextStats(text: string) {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
  
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
    readingTime: Math.ceil(words.length / 200) // Assuming 200 words per minute
  };
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return window.innerWidth < 768;
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get platform-specific app store URL
 */
export function getAppStoreUrl(): string {
  if (isIOS()) {
    return 'https://apps.apple.com/app/smartreview-ai/id123456789';
  } else if (isAndroid()) {
    return 'https://play.google.com/store/apps/details?id=com.smartreview.ai';
  } else {
    return '#';
  }
}

/**
 * Format rating as stars
 */
export function formatRatingStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
}

/**
 * Convert rating to percentage
 */
export function ratingToPercentage(rating: number): number {
  return Math.round((rating / 5) * 100);
}

/**
 * Get rating color class
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-green-600';
  if (rating >= 3) return 'text-yellow-600';
  if (rating >= 2) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Parse QR code data
 */
export function parseQRCode(qrData: string): { storeId: string | null; valid: boolean } {
  try {
    // Handle smartreview:// protocol
    if (qrData.startsWith('smartreview://')) {
      const url = new URL(qrData.replace('smartreview://', 'https://'));
      const storeId = url.searchParams.get('store_id');
      return { storeId, valid: !!storeId };
    }
    
    // Handle regular URLs
    if (qrData.startsWith('http')) {
      const url = new URL(qrData);
      const storeId = url.searchParams.get('store_id');
      return { storeId, valid: !!storeId };
    }
    
    // Handle direct store ID
    if (/^[a-zA-Z0-9\-_]+$/.test(qrData)) {
      return { storeId: qrData, valid: true };
    }
    
    return { storeId: null, valid: false };
  } catch (error) {
    return { storeId: null, valid: false };
  }
}

/**
 * Get character count for different platforms
 */
export function getPlatformLimits() {
  return {
    twitter: 280,
    google: 63206,
    yelp: 5000,
    facebook: 8000,
    instagram: 2200,
    linkedin: 1300
  };
}

/**
 * Check if text fits platform limits
 */
export function checkPlatformLimits(text: string) {
  const limits = getPlatformLimits();
  const length = text.length;
  
  return Object.entries(limits).reduce((acc, [platform, limit]) => {
    acc[platform] = {
      fits: length <= limit,
      remaining: limit - length,
      percentage: Math.round((length / limit) * 100)
    };
    return acc;
  }, {} as Record<string, { fits: boolean; remaining: number; percentage: number }>);
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

/**
 * Session storage helpers
 */
export const sessionStorage = {
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from sessionStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): boolean => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to sessionStorage key "${key}":`, error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
      return false;
    }
  }
};