# app/main.py
import os
from contextlib import asynccontextmanager
from pathlib import Path
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from api_endpoints import router as drive_router
from backend.api.sessions import router as sessions_router
# Lazy loading for faster cold starts
_adk_app = None

def get_adk_app():
    """Lazy load ADK to reduce cold start time."""
    global _adk_app
    if _adk_app is None:
        from google.adk.cli.fast_api import get_fast_api_app
        _adk_app = get_fast_api_app(
            agents_dir=os.path.dirname(os.path.abspath(__file__)),
            web=False,
        )
    return _adk_app

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan for startup/shutdown."""
    yield

app = FastAPI(
    title="FastAPI + Google ADK",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("ENABLE_DOCS") else None,
    redoc_url=None,
)
app.include_router(drive_router)
app.include_router(sessions_router)
# CORS configuration from environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
if ENVIRONMENT == "production":
    origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
else:
    origins = ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

# Health check endpoints (critical for Cloud Run)
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

# API routes
@app.get("/api/info")
async def api_info():
    return {"name": "FastAPI ADK Backend", "version": "1.0.0"}

# Serve frontend static files
STATIC_DIR = Path(__file__).parent.parent / "static"
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve React SPA for all non-API routes."""
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")