"""
店舗モデル定義
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class Location(BaseModel):
    """位置情報モデル"""
    address: str
    city: str
    prefecture: str
    postal_code: str = Field(alias="postalCode")
    lat: float
    lng: float
    nearest_station: str = Field(alias="nearestStation")
    walking_minutes: Optional[int] = Field(default=None, alias="walkingMinutes")
    
    class Config:
        populate_by_name = True

class Service(BaseModel):
    """サービスモデル"""
    id: str
    name: str
    name_en: Optional[str] = Field(default=None, alias="nameEn")
    description: Optional[str] = None
    category: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    
    class Config:
        populate_by_name = True

class Platform(BaseModel):
    """プラットフォームモデル"""
    type: str  # google, hotpepper, booking, tripadvisor
    url: str
    is_active: bool = Field(default=True, alias="isActive")
    
    class Config:
        populate_by_name = True

class StoreSettings(BaseModel):
    """店舗設定モデル"""
    available_languages: List[str] = Field(default=["ja"], alias="availableLanguages")
    default_language: str = Field(default="ja", alias="defaultLanguage")
    min_rating_for_external: int = Field(default=4, alias="minRatingForExternal")
    ai_model: str = Field(default="gpt-4-turbo-preview", alias="aiModel")
    
    class Config:
        populate_by_name = True

class Store(BaseModel):
    """店舗モデル"""
    store_id: str = Field(alias="storeId")
    name: str
    name_kana: Optional[str] = Field(default=None, alias="nameKana")
    description: str
    location: Location
    services: List[Service]
    seo_keywords: List[str] = Field(default_factory=list, alias="seoKeywords")
    platforms: List[Platform] = Field(default_factory=list)
    settings: StoreSettings
    images: List[Dict[str, str]] = Field(default_factory=list)
    created_at: Optional[datetime] = Field(default=None, alias="createdAt")
    updated_at: Optional[datetime] = Field(default=None, alias="updatedAt")
    
    class Config:
        populate_by_name = True

class StoreCreate(BaseModel):
    """店舗作成用モデル"""
    name: str
    name_kana: Optional[str] = Field(default=None, alias="nameKana")
    description: str
    location: Location
    services: List[Service]
    seo_keywords: List[str] = Field(default_factory=list, alias="seoKeywords")
    platforms: List[Platform] = Field(default_factory=list)
    settings: Optional[StoreSettings] = None
    
    class Config:
        populate_by_name = True

class StoreUpdate(BaseModel):
    """店舗更新用モデル"""
    name: Optional[str] = None
    name_kana: Optional[str] = Field(default=None, alias="nameKana")
    description: Optional[str] = None
    location: Optional[Location] = None
    services: Optional[List[Service]] = None
    seo_keywords: Optional[List[str]] = Field(default=None, alias="seoKeywords")
    platforms: Optional[List[Platform]] = None
    settings: Optional[StoreSettings] = None
    
    class Config:
        populate_by_name = True

class StoreResponse(BaseModel):
    """店舗レスポンスモデル"""
    store: Store
    
class StoreListResponse(BaseModel):
    """店舗一覧レスポンスモデル"""
    stores: List[Store]
    total: int
    page: int
    limit: int
