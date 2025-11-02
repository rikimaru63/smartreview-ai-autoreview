"""
Store service - Business logic for store management
"""

import logging
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.models.store import (
    Store, StoreCreate, StoreUpdate, Location, Service, Platform, StoreSettings
)

logger = logging.getLogger(__name__)

class StoreService:
    """Service for managing stores"""
    
    def __init__(self):
        """Initialize store service"""
        # In-memory storage for MVP (replace with database later)
        self._stores: Dict[str, Store] = {}
        self._qr_code_mappings: Dict[str, str] = {}  # QR code -> store_id mapping
        
        # Initialize with sample data for MVP
        self._initialize_sample_data()
    
    def _initialize_sample_data(self):
        """Initialize with sample store data for MVP"""
        try:
            # Sample location
            sample_location = Location(
                address="Tokyo Shibuya Jinnan 1-15-3",
                city="Shibuya",
                prefecture="Tokyo",
                postal_code="150-0041",
                lat=35.661777,
                lng=139.700065,
                nearest_station="JR Shibuya Station",
                walking_minutes=5
            )
            
            # Sample services
            sample_services = [
                Service(
                    id="hair-cut",
                    name="Hair Cut",
                    name_en="Hair Cut",
                    description="Professional hair cutting service",
                    category="Hair Care",
                    keywords=["cut", "style", "hair"]
                ),
                Service(
                    id="hair-color",
                    name="Hair Color",
                    name_en="Hair Color",
                    description="Hair coloring with various options",
                    category="Hair Care",
                    keywords=["color", "dye", "style"]
                )
            ]
            
            # Sample platforms
            sample_platforms = [
                Platform(
                    type="google",
                    url="https://www.google.com/maps/place/sample-salon",
                    is_active=True
                ),
                Platform(
                    type="hotpepper",
                    url="https://beauty.hotpepper.jp/slnH000000001/",
                    is_active=True
                )
            ]
            
            # Sample settings
            sample_settings = StoreSettings(
                available_languages=["ja", "en"],
                default_language="ja",
                min_rating_for_external=4,
                ai_model="gpt-4-turbo-preview"
            )
            
            # Create sample store
            store_id = "sample-salon-001"
            sample_store = Store(
                store_id=store_id,
                name="Sample Beauty Salon",
                name_kana="Sample Beauty Salon",
                description="A modern beauty salon providing professional services with the latest techniques.",
                location=sample_location,
                services=sample_services,
                seo_keywords=["beauty salon", "hair salon", "shibuya", "cut", "color", "style", "professional"],
                platforms=sample_platforms,
                settings=sample_settings,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Store the sample data
            self._stores[store_id] = sample_store
            
            # Create sample QR code mapping
            self._qr_code_mappings["qr_sample_001"] = store_id
            
            logger.info("Sample store data initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize sample data: {str(e)}")
    
    async def create_store(self, store_data: StoreCreate) -> Store:
        """
        Create a new store
        
        Args:
            store_data: Store creation data
            
        Returns:
            Created store
        """
        store_id = str(uuid.uuid4())
        
        # Use default settings if not provided
        settings = store_data.settings or StoreSettings()
        
        store = Store(
            store_id=store_id,
            name=store_data.name,
            name_kana=store_data.name_kana,
            description=store_data.description,
            location=store_data.location,
            services=store_data.services,
            seo_keywords=store_data.seo_keywords,
            platforms=store_data.platforms,
            settings=settings,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self._stores[store_id] = store
        logger.info(f"Created new store: {store_id}")
        
        return store
    
    async def get_store(self, store_id: str) -> Optional[Store]:
        """
        Get store by ID
        
        Args:
            store_id: Store identifier
            
        Returns:
            Store if found, None otherwise
        """
        return self._stores.get(store_id)
    
    async def get_store_by_qr(self, qr_code: str) -> Optional[Store]:
        """
        Get store by QR code
        
        Args:
            qr_code: QR code identifier
            
        Returns:
            Store if found, None otherwise
        """
        store_id = self._qr_code_mappings.get(qr_code)
        if store_id:
            return await self.get_store(store_id)
        return None
    
    async def update_store(self, store_id: str, update_data: StoreUpdate) -> Optional[Store]:
        """
        Update an existing store
        
        Args:
            store_id: Store identifier
            update_data: Update data
            
        Returns:
            Updated store if found, None otherwise
        """
        store = self._stores.get(store_id)
        if not store:
            return None
        
        # Update fields if provided
        update_dict = update_data.dict(exclude_unset=True)
        
        for field, value in update_dict.items():
            if hasattr(store, field) and value is not None:
                setattr(store, field, value)
        
        store.updated_at = datetime.utcnow()
        self._stores[store_id] = store
        
        logger.info(f"Updated store: {store_id}")
        return store
    
    async def delete_store(self, store_id: str) -> bool:
        """
        Delete a store
        
        Args:
            store_id: Store identifier
            
        Returns:
            True if deleted, False if not found
        """
        if store_id in self._stores:
            del self._stores[store_id]
            
            # Remove QR code mappings
            qr_codes_to_remove = [qr for qr, sid in self._qr_code_mappings.items() if sid == store_id]
            for qr_code in qr_codes_to_remove:
                del self._qr_code_mappings[qr_code]
            
            logger.info(f"Deleted store: {store_id}")
            return True
        return False
    
    async def list_stores(
        self, 
        page: int = 1, 
        limit: int = 20,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        List stores with pagination and search
        
        Args:
            page: Page number (1-based)
            limit: Number of stores per page
            search: Search term (optional)
            
        Returns:
            Dictionary with stores, total count, and pagination info
        """
        # Filter stores
        filtered_stores = list(self._stores.values())
        
        if search:
            search_lower = search.lower()
            filtered_stores = [
                store for store in filtered_stores
                if (search_lower in store.name.lower() or
                    search_lower in store.description.lower() or
                    (store.name_kana and search_lower in store.name_kana.lower()) or
                    any(search_lower in keyword.lower() for keyword in store.seo_keywords))
            ]
        
        # Sort by creation date (newest first)
        filtered_stores.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
        
        # Pagination
        total = len(filtered_stores)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_stores = filtered_stores[start_idx:end_idx]
        
        return {
            "stores": paginated_stores,
            "total": total,
            "page": page,
            "limit": limit
        }
    
    async def add_qr_mapping(self, qr_code: str, store_id: str) -> bool:
        """
        Add QR code mapping to store
        
        Args:
            qr_code: QR code identifier
            store_id: Store identifier
            
        Returns:
            True if added successfully, False if store not found
        """
        if store_id not in self._stores:
            return False
        
        self._qr_code_mappings[qr_code] = store_id
        logger.info(f"Added QR code mapping: {qr_code} -> {store_id}")
        return True
    
    async def remove_qr_mapping(self, qr_code: str) -> bool:
        """
        Remove QR code mapping
        
        Args:
            qr_code: QR code identifier
            
        Returns:
            True if removed, False if not found
        """
        if qr_code in self._qr_code_mappings:
            del self._qr_code_mappings[qr_code]
            logger.info(f"Removed QR code mapping: {qr_code}")
            return True
        return False
    
    def get_all_qr_mappings(self) -> Dict[str, str]:
        """
        Get all QR code mappings (for debugging/admin purposes)
        
        Returns:
            Dictionary of QR code -> store_id mappings
        """
        return self._qr_code_mappings.copy()

# Global store service instance
store_service = StoreService()