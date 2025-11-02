"""
Review API endpoints
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
import logging

from app.models.review import (
    Review, ReviewRequest, ReviewCreate, ReviewUpdate, ReviewStatus,
    ReviewResponse, ReviewListResponse, ReviewGenerationResult,
    ReviewAnalytics, FeedbackCapture
)
from app.services.review_service import review_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/generate", response_model=ReviewGenerationResult)
async def generate_review(request: ReviewRequest):
    """
    Generate a review using AI
    """
    try:
        result = await review_service.generate_review(request)
        return result
    except Exception as e:
        logger.error(f"Failed to generate review: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=ReviewResponse)
async def create_review(review_data: ReviewCreate):
    """
    Create a new review manually
    """
    try:
        review = await review_service.create_review(review_data)
        return ReviewResponse(review=review)
    except Exception as e:
        logger.error(f"Failed to create review: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=ReviewListResponse)
async def list_reviews(
    store_id: Optional[str] = Query(None, description="Filter by store ID"),
    status: Optional[ReviewStatus] = Query(None, description="Filter by review status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    List reviews with filtering and pagination
    """
    try:
        result = await review_service.list_reviews(
            store_id=store_id, status=status, page=page, limit=limit
        )
        return ReviewListResponse(**result)
    except Exception as e:
        logger.error(f"Failed to list reviews: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: str):
    """
    Get review by ID
    """
    try:
        review = await review_service.get_review(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        return ReviewResponse(review=review)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get review {review_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(review_id: str, update_data: ReviewUpdate):
    """
    Update review
    """
    try:
        review = await review_service.update_review(review_id, update_data)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        return ReviewResponse(review=review)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update review {review_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{review_id}")
async def delete_review(review_id: str):
    """
    Delete review
    """
    try:
        success = await review_service.delete_review(review_id)
        if not success:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"message": "Review deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete review {review_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{review_id}/publish", response_model=ReviewResponse)
async def publish_review(review_id: str):
    """
    Publish a review (change status to published)
    """
    try:
        review = await review_service.publish_review(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        return ReviewResponse(review=review)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to publish review {review_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/summary", response_model=ReviewAnalytics)
async def get_review_analytics(
    store_id: Optional[str] = Query(None, description="Filter by store ID")
):
    """
    Get review analytics
    """
    try:
        analytics = await review_service.get_analytics(store_id=store_id)
        return analytics
    except Exception as e:
        logger.error(f"Failed to get review analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/store/{store_id}", response_model=ReviewListResponse)
async def get_store_reviews(
    store_id: str,
    status: Optional[ReviewStatus] = Query(None, description="Filter by review status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get reviews for a specific store
    """
    try:
        result = await review_service.list_reviews(
            store_id=store_id, status=status, page=page, limit=limit
        )
        return ReviewListResponse(**result)
    except Exception as e:
        logger.error(f"Failed to get reviews for store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Feedback endpoints for low-rating reviews
@router.post("/feedback")
async def capture_feedback(feedback: FeedbackCapture):
    """
    Capture feedback for low-rating reviews
    """
    try:
        feedback_id = await review_service.capture_feedback(feedback)
        return {
            "message": "Feedback captured successfully",
            "feedback_id": feedback_id
        }
    except Exception as e:
        logger.error(f"Failed to capture feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback/{feedback_id}")
async def get_feedback(feedback_id: str):
    """
    Get feedback by ID
    """
    try:
        feedback = await review_service.get_feedback(feedback_id)
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return feedback
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get feedback {feedback_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback", response_model=dict)
async def list_feedback(
    store_id: Optional[str] = Query(None, description="Filter by store ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    List feedback with filtering and pagination
    """
    try:
        result = await review_service.list_feedback(
            store_id=store_id, page=page, limit=limit
        )
        return result
    except Exception as e:
        logger.error(f"Failed to list feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch operations
@router.post("/batch/generate")
async def batch_generate_reviews(requests: List[ReviewRequest]):
    """
    Generate multiple reviews in batch
    """
    try:
        results = []
        for request in requests:
            try:
                result = await review_service.generate_review(request)
                results.append({
                    "store_id": request.store_id,
                    "success": result.success,
                    "review_id": result.review.review_id if result.review else None,
                    "error": result.error
                })
            except Exception as e:
                results.append({
                    "store_id": request.store_id,
                    "success": False,
                    "review_id": None,
                    "error": str(e)
                })
        
        return {
            "message": f"Processed {len(requests)} review generation requests",
            "results": results
        }
    except Exception as e:
        logger.error(f"Failed to batch generate reviews: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch/publish")
async def batch_publish_reviews(review_ids: List[str]):
    """
    Publish multiple reviews in batch
    """
    try:
        results = []
        for review_id in review_ids:
            try:
                review = await review_service.publish_review(review_id)
                results.append({
                    "review_id": review_id,
                    "success": review is not None,
                    "error": None if review else "Review not found"
                })
            except Exception as e:
                results.append({
                    "review_id": review_id,
                    "success": False,
                    "error": str(e)
                })
        
        return {
            "message": f"Processed {len(review_ids)} publish requests",
            "results": results
        }
    except Exception as e:
        logger.error(f"Failed to batch publish reviews: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check for review generation
@router.get("/health/ai")
async def check_ai_health():
    """
    Check if AI service is healthy and can generate reviews
    """
    try:
        # Simple health check by trying to import the AI service
        from app.services.ai_service import ai_service
        from app.core.config import settings
        
        health_status = {
            "ai_service": "available",
            "openai_configured": settings.OPENAI_API_KEY is not None,
            "model": settings.OPENAI_MODEL
        }
        
        return health_status
    except Exception as e:
        logger.error(f"AI health check failed: {str(e)}")
        return {
            "ai_service": "unavailable",
            "error": str(e)
        }