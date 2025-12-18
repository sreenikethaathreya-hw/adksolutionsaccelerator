"""
HatchWorks AI Backend - Main FastAPI Application
Organized structure with agents/ subdirectory
"""

from contextlib import asynccontextmanager
from datetime import datetime
import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Import routers from backend modules
from backend.api.auth import router as auth_router
from backend.api.sessions import router as sessions_router
from backend.api.drive import router as drive_router
from backend.api.chat import router as chat_router
from backend.api.agents import router as agents_router
from backend.api.agents_chat import router as agents_chat_router
from backend.api.upload import router as upload_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan for startup/shutdown."""
    logger.info(f"🚀 Starting HatchWorks AI Backend (env: {ENVIRONMENT})")
    yield
    logger.info("👋 Shutting down HatchWorks AI Backend")

# Initialize FastAPI
app = FastAPI(
    title="HatchWorks AI API",
    version="1.0.0",
    description="AI-powered financial analysis platform with multi-agent system",
    lifespan=lifespan,
    docs_url="/docs" if ENVIRONMENT != "production" else None,
    redoc_url=None,
)

# CORS configuration
if ENVIRONMENT == "production":
    origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

# Include API routers - ORDER MATTERS! Specific routes before catch-all
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(sessions_router)
app.include_router(drive_router, prefix="/api/drive", tags=["Google Drive"])
app.include_router(agents_router, prefix="/agents", tags=["Agents"])
app.include_router(agents_chat_router)
app.include_router(chat_router, prefix="/agents", tags=["Chat"])
app.include_router(upload_router)  # Streaming chat endpoints

# Health check endpoints
@app.get("/health")
async def health_check():
    """Health check for Cloud Run probes."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": ENVIRONMENT,
    }

@app.get("/health/ready")
async def readiness_check():
    """Readiness probe - verify dependencies."""
    return {"status": "ready"}

@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "name": "HatchWorks AI API",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "status": "running"
    }

# Serve frontend static files (if available)
# IMPORTANT: This must come AFTER all API routes!
STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve React SPA for all non-API routes."""
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8080")),
        reload=ENVIRONMENT == "development"
    )
