"""
Review model definitions
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class ReviewType(str, Enum):
    """Review type enumeration"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class ReviewStatus(str, Enum):
    """Review status enumeration"""
    DRAFT = "draft"
    GENERATED = "generated"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class ReviewSource(str, Enum):
    """Review source enumeration"""
    AI_GENERATED = "ai_generated"
    USER_INPUT = "user_input"
    MANUAL = "manual"

class ReviewMetadata(BaseModel):
    """Review metadata model"""
    keywords_used: List[str] = Field(default_factory=list, alias="keywordsUsed")
    sentiment_score: Optional[float] = Field(default=None, alias="sentimentScore")
    readability_score: Optional[float] = Field(default=None, alias="readabilityScore")
    ai_model_used: Optional[str] = Field(default=None, alias="aiModelUsed")
    generation_time: Optional[float] = Field(default=None, alias="generationTime")
    
    class Config:
        populate_by_name = True

class Review(BaseModel):
    """Review model"""
    review_id: str = Field(alias="reviewId")
    store_id: str = Field(alias="storeId")
    rating: int = Field(ge=1, le=5)
    title: str
    content: str
    review_type: ReviewType = Field(alias="reviewType")
    review_source: ReviewSource = Field(alias="reviewSource")
    language: str = Field(default="ja")
    seo_keywords: List[str] = Field(default_factory=list, alias="seoKeywords")
    metadata: ReviewMetadata
    status: ReviewStatus = Field(default=ReviewStatus.DRAFT)
    created_at: Optional[datetime] = Field(default=None, alias="createdAt")
    updated_at: Optional[datetime] = Field(default=None, alias="updatedAt")
    published_at: Optional[datetime] = Field(default=None, alias="publishedAt")
    
    class Config:
        populate_by_name = True

class ReviewRequest(BaseModel):
    """Review generation request model"""
    store_id: str = Field(alias="storeId")
    rating: int = Field(ge=1, le=5)
    service_keywords: Optional[List[str]] = Field(default=None, alias="serviceKeywords")
    custom_prompt: Optional[str] = Field(default=None, alias="customPrompt")
    language: str = Field(default="ja")
    include_seo: bool = Field(default=True, alias="includeSeo")
    review_length: str = Field(default="medium", regex="^(short|medium|long)$", alias="reviewLength")
    tone: str = Field(default="friendly", regex="^(formal|friendly|casual)$")
    
    class Config:
        populate_by_name = True

class ReviewCreate(BaseModel):
    """Review creation model"""
    store_id: str = Field(alias="storeId")
    rating: int = Field(ge=1, le=5)
    title: str
    content: str
    review_type: ReviewType = Field(alias="reviewType")
    review_source: ReviewSource = Field(alias="reviewSource")
    language: str = Field(default="ja")
    seo_keywords: List[str] = Field(default_factory=list, alias="seoKeywords")
    metadata: Optional[ReviewMetadata] = None
    
    class Config:
        populate_by_name = True

class ReviewUpdate(BaseModel):
    """Review update model"""
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    title: Optional[str] = None
    content: Optional[str] = None
    review_type: Optional[ReviewType] = Field(default=None, alias="reviewType")
    seo_keywords: Optional[List[str]] = Field(default=None, alias="seoKeywords")
    metadata: Optional[ReviewMetadata] = None
    status: Optional[ReviewStatus] = None
    
    class Config:
        populate_by_name = True

class ReviewGenerationResult(BaseModel):
    """Review generation result model"""
    success: bool
    review: Optional[Review] = None
    error: Optional[str] = None
    suggestions: List[str] = Field(default_factory=list)
    redirect_platforms: List[str] = Field(default_factory=list, alias="redirectPlatforms")
    
    class Config:
        populate_by_name = True

class ReviewResponse(BaseModel):
    """Review response model"""
    review: Review

class ReviewListResponse(BaseModel):
    """Review list response model"""
    reviews: List[Review]
    total: int
    page: int
    limit: int

class ReviewAnalytics(BaseModel):
    """Review analytics model"""
    total_reviews: int = Field(alias="totalReviews")
    average_rating: float = Field(alias="averageRating")
    rating_distribution: Dict[str, int] = Field(alias="ratingDistribution")
    reviews_by_type: Dict[str, int] = Field(alias="reviewsByType")
    reviews_by_status: Dict[str, int] = Field(alias="reviewsByStatus")
    generated_today: int = Field(alias="generatedToday")
    generated_this_week: int = Field(alias="generatedThisWeek")
    generated_this_month: int = Field(alias="generatedThisMonth")
    
    class Config:
        populate_by_name = True

class FeedbackCapture(BaseModel):
    """Feedback capture model for low-rating reviews"""
    store_id: str = Field(alias="storeId")
    rating: int = Field(ge=1, le=5)
    feedback_content: str = Field(alias="feedbackContent")
    improvement_areas: List[str] = Field(default_factory=list, alias="improvementAreas")
    contact_info: Optional[str] = Field(default=None, alias="contactInfo")
    follow_up_required: bool = Field(default=False, alias="followUpRequired")
    created_at: Optional[datetime] = Field(default=None, alias="createdAt")
    
    class Config:
        populate_by_name = True