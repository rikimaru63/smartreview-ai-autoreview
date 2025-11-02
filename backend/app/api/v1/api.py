"""
Main API router for v1 endpoints
"""

from fastapi import APIRouter
from app.api.v1.endpoints import store, review

# Create the main v1 router
api_router = APIRouter(prefix="/api/v1")

# Include endpoint routers
api_router.include_router(store.router)
api_router.include_router(review.router)

# Health check endpoint for the API
@api_router.get("/health")
async def api_health():
    """
    API health check endpoint
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "endpoints": {
            "stores": "/api/v1/stores",
            "reviews": "/api/v1/reviews"
        }
    }

# Info endpoint
@api_router.get("/info")
async def api_info():
    """
    API information endpoint
    """
    return {
        "name": "SmartReview AI API",
        "version": "1.0.0",
        "description": "AI-powered review generation system with SEO optimization",
        "features": [
            "AI review generation using OpenAI",
            "Store management via QR codes",
            "Rating-based review routing",
            "SEO keyword optimization",
            "Feedback capture for low ratings",
            "Review analytics and insights"
        ],
        "endpoints": {
            "stores": {
                "description": "Store management endpoints",
                "base_path": "/api/v1/stores",
                "features": [
                    "CRUD operations for stores",
                    "QR code mapping",
                    "Service and platform management",
                    "Settings configuration"
                ]
            },
            "reviews": {
                "description": "Review management endpoints",
                "base_path": "/api/v1/reviews",
                "features": [
                    "AI-powered review generation",
                    "Manual review creation and editing",
                    "Review publishing workflow",
                    "Analytics and reporting",
                    "Feedback capture for improvements"
                ]
            }
        }
    }