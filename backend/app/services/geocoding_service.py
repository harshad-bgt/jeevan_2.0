import logging
import requests
import asyncio

logger = logging.getLogger(__name__)

def _sync_geocode(address: str) -> dict:
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": address,
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "Jeevan-Blood-Donation-App/2.0"
    }
    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data and len(data) > 0:
            return {
                "lat": float(data[0]["lat"]),
                "lng": float(data[0]["lon"])
            }
    except Exception as e:
        logger.error(f"Geocoding failed for {address}: {e}")
        
    # Fallback coordinates (center of Chennai)
    return {
        "lat": 13.0827,
        "lng": 80.2707
    }

async def geocode_address(address: str) -> dict:
    """
    Geocodes an address to coordinates using OpenStreetMap Nominatim API.
    """
    logger.info(f"Geocoding address: {address}")
    return await asyncio.to_thread(_sync_geocode, address)
