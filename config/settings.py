import os
from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Observatorio de Medios de Chile"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Base de datos
    DATABASE_URL: str = Field(
        default="sqlite:///./observatorio.db",
        description="URL de conexión SQLAlchemy (SQLite o PostgreSQL con pgvector)"
    )
    
    # Ingestión
    USER_AGENT: str = "ChileMediaObservatoryBot/1.0 (+https://observatorio-chile.cl/bot; compliance@observatorio-chile.cl)"
    INGESTION_TIMEOUT_SECONDS: int = 15
    RATE_LIMIT_PER_HOST_SECONDS: float = 1.0
    MAX_ARTICLES_PER_FEED: int = 25
    
    # Privacidad y Ley N° 21.719
    PII_FILTER_ENABLED: bool = True
    MASK_RUTS: bool = True
    MASK_EMAILS: bool = True
    MASK_PHONES: bool = True
    
    # Procesamiento y Clustering
    SIMILARITY_THRESHOLD: float = 0.28
    TEMPORAL_WINDOW_HOURS: int = 48
    EMBEDDING_DIM: int = 512
    
    # Motor de Puntos Ciegos (Blindspot Engine)
    BLINDSPOT_HIGH_COVERAGE_THRESHOLD: float = 0.65  # 65% de cobertura en un espectro
    BLINDSPOT_LOW_COVERAGE_THRESHOLD: float = 0.20   # 20% o menos en el opuesto
    BALANCED_TOLERANCE: float = 0.30

settings = Settings()
