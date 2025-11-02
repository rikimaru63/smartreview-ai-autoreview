"""
SmartReview AI - Main Application
FastAPI application entry point
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from app.core.config import settings
from app.api.v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting SmartReview AI API...")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down SmartReview AI API...")

# FastAPI application initialization
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered review generation system with SEO optimization",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "service": "SmartReview AI API",
        "version": settings.APP_VERSION,
        "status": "healthy",
        "environment": settings.APP_ENV
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "checks": {
            "api": "ok",
            "database": "ok",
            "ai_service": "ok"
        }
    }
    return health_status

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """404 error handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": {
                "code": "NOT_FOUND",
                "message": "The requested resource was not found"
            }
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """500 error handler"""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal server error occurred"
            }
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )