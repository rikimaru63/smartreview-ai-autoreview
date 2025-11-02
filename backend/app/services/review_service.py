"""
Review service - Business logic for review management
"""

import logging
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.models.review import (
    Review, ReviewRequest, ReviewCreate, ReviewUpdate, 
    ReviewType, ReviewStatus, ReviewSource, ReviewGenerationResult,
    ReviewAnalytics, FeedbackCapture
)
from app.models.store import Store
from app.services.ai_service import ai_service
from app.services.store_service import store_service

logger = logging.getLogger(__name__)

class ReviewService:
    """Service for managing reviews and review generation"""
    
    def __init__(self):
        """Initialize review service"""
        # In-memory storage for MVP (replace with database later)
        self._reviews: Dict[str, Review] = {}
        self._feedback: Dict[str, FeedbackCapture] = {}
    
    async def generate_review(self, request: ReviewRequest) -> ReviewGenerationResult:
        """
        Generate a review using AI service
        
        Args:
            request: Review generation request
            
        Returns:
            ReviewGenerationResult with generated review or error
        """
        try:
            # Get store information
            store = await store_service.get_store(request.store_id)
            if not store:
                return ReviewGenerationResult(
                    success=False,
                    error=f"Store not found: {request.store_id}"
                )
            
            # Determine review routing based on rating
            redirect_platforms = self._get_redirect_platforms(store, request.rating)
            
            # For low ratings, capture feedback instead of generating review
            if request.rating < store.settings.min_rating_for_external:
                return ReviewGenerationResult(
                    success=True,
                    review=None,
                    suggestions=[
                        "This is a low rating review. Please provide feedback for improvement.",
                        "Your valuable feedback will be used to improve our services."
                    ],
                    redirect_platforms=[]
                )
            
            # Generate review using AI
            title, content, metadata = await ai_service.generate_review(store, request)
            
            # Determine review type based on rating
            review_type = self._determine_review_type(request.rating)
            
            # Create review object
            review_id = str(uuid.uuid4())
            review = Review(
                review_id=review_id,
                store_id=request.store_id,
                rating=request.rating,
                title=title,
                content=content,
                review_type=review_type,
                review_source=ReviewSource.AI_GENERATED,
                language=request.language,
                seo_keywords=store.seo_keywords if request.include_seo else [],
                metadata=metadata,
                status=ReviewStatus.GENERATED,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Save review
            self._reviews[review_id] = review
            
            return ReviewGenerationResult(
                success=True,
                review=review,
                redirect_platforms=redirect_platforms
            )
            
        except Exception as e:
            logger.error(f"Review generation failed: {str(e)}")
            return ReviewGenerationResult(
                success=False,
                error=str(e)
            )
    
    async def create_review(self, review_data: ReviewCreate) -> Review:
        """
        Create a new review manually
        
        Args:
            review_data: Review creation data
            
        Returns:
            Created review
        """
        review_id = str(uuid.uuid4())
        
        review = Review(
            review_id=review_id,
            store_id=review_data.store_id,
            rating=review_data.rating,
            title=review_data.title,
            content=review_data.content,
            review_type=review_data.review_type,
            review_source=review_data.review_source,
            language=review_data.language,
            seo_keywords=review_data.seo_keywords,
            metadata=review_data.metadata or {},
            status=ReviewStatus.DRAFT,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self._reviews[review_id] = review
        return review
    
    async def get_review(self, review_id: str) -> Optional[Review]:
        """
        Get review by ID
        
        Args:
            review_id: Review identifier
            
        Returns:
            Review if found, None otherwise
        """
        return self._reviews.get(review_id)
    
    async def update_review(self, review_id: str, update_data: ReviewUpdate) -> Optional[Review]:
        """
        Update an existing review
        
        Args:
            review_id: Review identifier
            update_data: Update data
            
        Returns:
            Updated review if found, None otherwise
        """
        review = self._reviews.get(review_id)
        if not review:
            return None
        
        # Update fields if provided
        update_dict = update_data.dict(exclude_unset=True)
        
        for field, value in update_dict.items():
            if hasattr(review, field) and value is not None:
                setattr(review, field, value)
        
        review.updated_at = datetime.utcnow()
        self._reviews[review_id] = review
        
        return review
    
    async def delete_review(self, review_id: str) -> bool:
        """
        Delete a review
        
        Args:
            review_id: Review identifier
            
        Returns:
            True if deleted, False if not found
        """
        if review_id in self._reviews:
            del self._reviews[review_id]
            return True
        return False
    
    async def list_reviews(
        self, 
        store_id: Optional[str] = None,
        status: Optional[ReviewStatus] = None,
        page: int = 1, 
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        List reviews with filtering and pagination
        
        Args:
            store_id: Filter by store ID
            status: Filter by review status
            page: Page number (1-based)
            limit: Number of reviews per page
            
        Returns:
            Dictionary with reviews, total count, and pagination info
        """
        # Filter reviews
        filtered_reviews = list(self._reviews.values())
        
        if store_id:
            filtered_reviews = [r for r in filtered_reviews if r.store_id == store_id]
        
        if status:
            filtered_reviews = [r for r in filtered_reviews if r.status == status]
        
        # Sort by creation date (newest first)
        filtered_reviews.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
        
        # Pagination
        total = len(filtered_reviews)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_reviews = filtered_reviews[start_idx:end_idx]
        
        return {
            "reviews": paginated_reviews,
            "total": total,
            "page": page,
            "limit": limit
        }
    
    async def publish_review(self, review_id: str) -> Optional[Review]:
        """
        Publish a review (change status to published)
        
        Args:
            review_id: Review identifier
            
        Returns:
            Published review if found, None otherwise
        """
        review = self._reviews.get(review_id)
        if not review:
            return None
        
        review.status = ReviewStatus.PUBLISHED
        review.published_at = datetime.utcnow()
        review.updated_at = datetime.utcnow()
        
        self._reviews[review_id] = review
        return review
    
    async def get_analytics(self, store_id: Optional[str] = None) -> ReviewAnalytics:
        """
        Get review analytics
        
        Args:
            store_id: Filter by store ID (optional)
            
        Returns:
            Review analytics data
        """
        # Filter reviews
        reviews = list(self._reviews.values())
        if store_id:
            reviews = [r for r in reviews if r.store_id == store_id]
        
        if not reviews:
            return ReviewAnalytics(
                total_reviews=0,
                average_rating=0.0,
                rating_distribution={str(i): 0 for i in range(1, 6)},
                reviews_by_type={"positive": 0, "neutral": 0, "negative": 0},
                reviews_by_status={"draft": 0, "generated": 0, "published": 0, "archived": 0},
                generated_today=0,
                generated_this_week=0,
                generated_this_month=0
            )
        
        # Calculate analytics
        total_reviews = len(reviews)
        average_rating = sum(r.rating for r in reviews) / total_reviews
        
        # Rating distribution
        rating_distribution = {str(i): 0 for i in range(1, 6)}
        for review in reviews:
            rating_distribution[str(review.rating)] += 1
        
        # Reviews by type
        reviews_by_type = {"positive": 0, "neutral": 0, "negative": 0}
        for review in reviews:
            reviews_by_type[review.review_type.value] += 1
        
        # Reviews by status
        reviews_by_status = {"draft": 0, "generated": 0, "published": 0, "archived": 0}
        for review in reviews:
            reviews_by_status[review.status.value] += 1
        
        # Time-based counts (simplified for MVP)
        now = datetime.utcnow()
        generated_today = sum(1 for r in reviews if r.created_at and r.created_at.date() == now.date())
        generated_this_week = sum(1 for r in reviews if r.created_at and (now - r.created_at).days <= 7)
        generated_this_month = sum(1 for r in reviews if r.created_at and (now - r.created_at).days <= 30)
        
        return ReviewAnalytics(
            total_reviews=total_reviews,
            average_rating=average_rating,
            rating_distribution=rating_distribution,
            reviews_by_type=reviews_by_type,
            reviews_by_status=reviews_by_status,
            generated_today=generated_today,
            generated_this_week=generated_this_week,
            generated_this_month=generated_this_month
        )
    
    async def capture_feedback(self, feedback: FeedbackCapture) -> str:
        """
        Capture feedback for low-rating reviews
        
        Args:
            feedback: Feedback capture data
            
        Returns:
            Feedback ID
        """
        feedback_id = str(uuid.uuid4())
        feedback.created_at = datetime.utcnow()
        
        self._feedback[feedback_id] = feedback
        
        # Generate improvement suggestions if AI service is available
        try:
            store = await store_service.get_store(feedback.store_id)
            if store:
                suggestions = await ai_service.suggest_improvements(store, feedback.feedback_content)
                logger.info(f"Generated {len(suggestions)} improvement suggestions for store {feedback.store_id}")
        except Exception as e:
            logger.error(f"Failed to generate improvement suggestions: {str(e)}")
        
        return feedback_id
    
    async def get_feedback(self, feedback_id: str) -> Optional[FeedbackCapture]:
        """
        Get feedback by ID
        
        Args:
            feedback_id: Feedback identifier
            
        Returns:
            Feedback if found, None otherwise
        """
        return self._feedback.get(feedback_id)
    
    async def list_feedback(
        self, 
        store_id: Optional[str] = None,
        page: int = 1, 
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        List feedback with filtering and pagination
        
        Args:
            store_id: Filter by store ID
            page: Page number (1-based)
            limit: Number of feedback entries per page
            
        Returns:
            Dictionary with feedback, total count, and pagination info
        """
        # Filter feedback
        filtered_feedback = list(self._feedback.values())
        
        if store_id:
            filtered_feedback = [f for f in filtered_feedback if f.store_id == store_id]
        
        # Sort by creation date (newest first)
        filtered_feedback.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
        
        # Pagination
        total = len(filtered_feedback)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_feedback = filtered_feedback[start_idx:end_idx]
        
        return {
            "feedback": paginated_feedback,
            "total": total,
            "page": page,
            "limit": limit
        }
    
    def _determine_review_type(self, rating: int) -> ReviewType:
        """Determine review type based on rating"""
        if rating >= 4:
            return ReviewType.POSITIVE
        elif rating == 3:
            return ReviewType.NEUTRAL
        else:
            return ReviewType.NEGATIVE
    
    def _get_redirect_platforms(self, store: Store, rating: int) -> List[str]:
        """Get platforms to redirect to based on rating"""
        if rating >= store.settings.min_rating_for_external:
            # High rating - redirect to external platforms
            return [platform.url for platform in store.platforms if platform.is_active]
        else:
            # Low rating - keep internal for feedback
            return []

# Global review service instance
review_service = ReviewService()