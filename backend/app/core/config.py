import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PropValue AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "dev_secret_key_propvalue_ai_secure_token_change_in_production_min32chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ALGORITHM: str = "HS256"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./propvalue.db"
    
    # Redis (Optional)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Initial Market: Pune Geospatial Bounds
    PUNE_BOUNDS: dict = {
        "min_lat": 18.35,
        "max_lat": 18.75,
        "min_lon": 73.65,
        "max_lon": 74.05,
        "center_lat": 18.5204,
        "center_lon": 73.8567
    }

    # External Provider Configs
    OSM_OVERPASS_ENDPOINT: str = "https://overpass-api.de/api/interpreter"
    MAHARERA_API_KEY: str = ""
    MAHARASHTRA_IGR_API_KEY: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()

