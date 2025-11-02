"""
Configuration settings for SmartReview AI
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = Field(default="SmartReview AI", env="APP_NAME")
    APP_VERSION: str = Field(default="1.0.0", env="APP_VERSION")
    APP_ENV: str = Field(default="development", env="APP_ENV")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Security
    SECRET_KEY: str = Field(default="change-this-secret-key-in-production", env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # Firebase
    FIREBASE_PROJECT_ID: Optional[str] = Field(default=None, env="FIREBASE_PROJECT_ID")
    FIREBASE_PRIVATE_KEY_ID: Optional[str] = Field(default=None, env="FIREBASE_PRIVATE_KEY_ID")
    FIREBASE_PRIVATE_KEY: Optional[str] = Field(default=None, env="FIREBASE_PRIVATE_KEY")
    FIREBASE_CLIENT_EMAIL: Optional[str] = Field(default=None, env="FIREBASE_CLIENT_EMAIL")
    FIREBASE_CLIENT_ID: Optional[str] = Field(default=None, env="FIREBASE_CLIENT_ID")
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4-turbo-preview", env="OPENAI_MODEL")
    OPENAI_MAX_TOKENS: int = Field(default=500, env="OPENAI_MAX_TOKENS")
    OPENAI_TEMPERATURE: float = Field(default=0.7, env="OPENAI_TEMPERATURE")
    
    # Google Cloud
    GCP_PROJECT_ID: Optional[str] = Field(default=None, env="GCP_PROJECT_ID")
    GCP_STORAGE_BUCKET: Optional[str] = Field(default=None, env="GCP_STORAGE_BUCKET")
    
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        env="CORS_ORIGINS"
    )
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    AI_RATE_LIMIT_PER_MINUTE: int = Field(default=20, env="AI_RATE_LIMIT_PER_MINUTE")
    
    # Database (for future use)
    DATABASE_URL: Optional[str] = Field(default=None, env="DATABASE_URL")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
    def get_firebase_config(self) -> dict:
        """Get Firebase configuration"""
        if not self.FIREBASE_PROJECT_ID:
            return {}
            
        return {
            "type": "service_account",
            "project_id": self.FIREBASE_PROJECT_ID,
            "private_key_id": self.FIREBASE_PRIVATE_KEY_ID,
            "private_key": self.FIREBASE_PRIVATE_KEY.replace("\\n", "\n") if self.FIREBASE_PRIVATE_KEY else None,
            "client_email": self.FIREBASE_CLIENT_EMAIL,
            "client_id": self.FIREBASE_CLIENT_ID,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{self.FIREBASE_CLIENT_EMAIL}"
        }
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.APP_ENV == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.APP_ENV == "development"

# Global settings instance
settings = Settings()