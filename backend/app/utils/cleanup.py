import asyncio
import logging
from app.config.settings import get_settings
from app.services.room_manager import room_manager

logger = logging.getLogger("sharewithotp.cleanup")


async def run_periodic_cleanup():
    """Background loop that cleans up expired rooms automatically."""
    settings = get_settings()
    logger.info(f"Periodic cleanup task started (checking every {settings.CLEANUP_INTERVAL_SECONDS}s).")
    try:
        while True:
            await asyncio.sleep(settings.CLEANUP_INTERVAL_SECONDS)
            cleared = await room_manager.cleanup_expired_rooms()
            if cleared > 0:
                logger.info(f"Cleaned up {cleared} expired room(s).")
    except asyncio.CancelledError:
        logger.info("Periodic cleanup task stopped.")
