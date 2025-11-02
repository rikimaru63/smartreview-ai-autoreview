import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { ReviewData, GeneratedReview } from '../types';

interface UseReviewGenerationReturn {
  generateReview: (data: ReviewData) => void;
  isLoading: boolean;
  error: string | null;
  review: GeneratedReview | null;
  reset: () => void;
}

export function useReviewGeneration(): UseReviewGenerationReturn {
  const [review, setReview] = useState<GeneratedReview | null>(null);

  const mutation = useMutation({
    mutationFn: (data: ReviewData) => apiService.generateReview(data),
    onSuccess: (response) => {
      setReview(response.data);
    },
    onError: (error: any) => {
      console.error('Review generation failed:', error);
    }
  });

  const reset = () => {
    setReview(null);
    mutation.reset();
  };

  return {
    generateReview: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    review,
    reset
  };
}