import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import rooms_router, signaling_router
from app.config.settings import get_settings
from app.utils.cleanup import run_periodic_cleanup

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sharewithotp")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager: starts background cleanup and handles shutdown."""
    settings = get_settings()
    logger.info("Initializing ShareWithOTP Backend...")
    logger.info("STUN Server: %s", settings.STUN_SERVER_URL)
    logger.info("Room expiry: %ds, Max attempts: %d", settings.ROOM_EXPIRY_SECONDS, settings.MAX_OTP_ATTEMPTS)

    # Start background room cleanup task
    cleanup_task = asyncio.create_task(run_periodic_cleanup())

    yield

    # Graceful shutdown
    logger.info("Shutting down ShareWithOTP Backend...")
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="ShareWithOTP API",
    description=(
        "Privacy-first temporary peer-to-peer file sharing signaling and session server. "
        "The backend coordinates room lifecycles and WebRTC signaling; "
        "file data NEVER touches or passes through this server."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
cors_origins = settings.CORS_ORIGINS

# Setup CORS for frontend clients
# When wildcard origin is requested with credentials, browsers require regex or origin reflection
if "*" in cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register API Routers
app.include_router(rooms_router)
app.include_router(signaling_router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint confirming server operation and STUN configuration."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "stun_server": settings.STUN_SERVER_URL,
        "mode": "Phase 1 - Direct WebRTC P2P Signaling",
    }


# Static Frontend Hosting Fallback (if built dist directory exists)
frontend_dist = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)

if os.path.isdir(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_frontend(full_path: str):
        # Exclude API endpoints from SPA fallback
        if full_path.startswith("api") or full_path.startswith("ws") or full_path in ("docs", "openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found.")
        file_target = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_target):
            return FileResponse(file_target)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "name": "ShareWithOTP - Privacy-First P2P Transfer API",
            "version": "1.0.0",
            "docs_url": "/docs",
        }
