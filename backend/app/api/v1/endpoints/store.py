"""
Store API endpoints
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
import logging

from app.models.store import (
    Store, StoreCreate, StoreUpdate, StoreResponse, StoreListResponse,
    Service, Platform, StoreSettings
)
from app.services.store_service import store_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stores", tags=["stores"])

@router.post("", response_model=StoreResponse)
async def create_store(store_data: StoreCreate):
    """
    Create a new store
    """
    try:
        store = await store_service.create_store(store_data)
        return StoreResponse(store=store)
    except Exception as e:
        logger.error(f"Failed to create store: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=StoreListResponse)
async def list_stores(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term")
):
    """
    List stores with pagination and search
    """
    try:
        result = await store_service.list_stores(page=page, limit=limit, search=search)
        return StoreListResponse(**result)
    except Exception as e:
        logger.error(f"Failed to list stores: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(store_id: str):
    """
    Get store by ID
    """
    try:
        store = await store_service.get_store(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        return StoreResponse(store=store)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/qr/{qr_code}", response_model=StoreResponse)
async def get_store_by_qr(qr_code: str):
    """
    Get store by QR code
    """
    try:
        store = await store_service.get_store_by_qr(qr_code)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found for QR code")
        return StoreResponse(store=store)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get store by QR code {qr_code}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{store_id}", response_model=StoreResponse)
async def update_store(store_id: str, update_data: StoreUpdate):
    """
    Update store
    """
    try:
        store = await store_service.update_store(store_id, update_data)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        return StoreResponse(store=store)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{store_id}")
async def delete_store(store_id: str):
    """
    Delete store
    """
    try:
        success = await store_service.delete_store(store_id)
        if not success:
            raise HTTPException(status_code=404, detail="Store not found")
        return {"message": "Store deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# QR Code Management
@router.post("/{store_id}/qr/{qr_code}")
async def add_qr_mapping(store_id: str, qr_code: str):
    """
    Add QR code mapping to store
    """
    try:
        success = await store_service.add_qr_mapping(qr_code, store_id)
        if not success:
            raise HTTPException(status_code=404, detail="Store not found")
        return {"message": "QR code mapping added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add QR mapping {qr_code} to store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/qr/{qr_code}")
async def remove_qr_mapping(qr_code: str):
    """
    Remove QR code mapping
    """
    try:
        success = await store_service.remove_qr_mapping(qr_code)
        if not success:
            raise HTTPException(status_code=404, detail="QR code mapping not found")
        return {"message": "QR code mapping removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to remove QR mapping {qr_code}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Service Management
@router.get("/{store_id}/services", response_model=List[Service])
async def get_store_services(store_id: str):
    """
    Get services for a store
    """
    try:
        services = await store_service.get_store_services(store_id)
        return services
    except Exception as e:
        logger.error(f"Failed to get services for store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{store_id}/services")
async def add_store_service(store_id: str, service: Service):
    """
    Add service to store
    """
    try:
        success = await store_service.add_store_service(store_id, service)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to add service (store not found or service already exists)")
        return {"message": "Service added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add service to store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{store_id}/services/{service_id}")
async def remove_store_service(store_id: str, service_id: str):
    """
    Remove service from store
    """
    try:
        success = await store_service.remove_store_service(store_id, service_id)
        if not success:
            raise HTTPException(status_code=404, detail="Store or service not found")
        return {"message": "Service removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to remove service {service_id} from store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Platform Management
@router.get("/{store_id}/platforms", response_model=List[Platform])
async def get_store_platforms(store_id: str):
    """
    Get platforms for a store
    """
    try:
        platforms = await store_service.get_store_platforms(store_id)
        return platforms
    except Exception as e:
        logger.error(f"Failed to get platforms for store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{store_id}/platforms")
async def add_store_platform(store_id: str, platform: Platform):
    """
    Add platform to store
    """
    try:
        success = await store_service.add_store_platform(store_id, platform)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to add platform (store not found or platform type already exists)")
        return {"message": "Platform added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add platform to store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{store_id}/platforms/{platform_type}")
async def remove_store_platform(store_id: str, platform_type: str):
    """
    Remove platform from store
    """
    try:
        success = await store_service.remove_store_platform(store_id, platform_type)
        if not success:
            raise HTTPException(status_code=404, detail="Store or platform not found")
        return {"message": "Platform removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to remove platform {platform_type} from store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Settings Management
@router.put("/{store_id}/settings")
async def update_store_settings(store_id: str, settings: StoreSettings):
    """
    Update store settings
    """
    try:
        success = await store_service.update_store_settings(store_id, settings)
        if not success:
            raise HTTPException(status_code=404, detail="Store not found")
        return {"message": "Settings updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update settings for store {store_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Admin endpoints (for debugging)
@router.get("/admin/qr-mappings")
async def get_all_qr_mappings():
    """
    Get all QR code mappings (admin only)
    """
    try:
        mappings = store_service.get_all_qr_mappings()
        return {"qr_mappings": mappings}
    except Exception as e:
        logger.error(f"Failed to get QR mappings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))