from fastapi import APIRouter, Depends
from app.config.database import get_database
from app.middleware.auth import get_current_user
import math
import random

router = APIRouter()

@router.get("/live")
async def get_live_donors():
    """
    Returns public list of active donors for the live map.
    Only exposes masked data.
    """
    db = get_database()
    cursor = db.users.find(
        {"role": "donor", "isAvailable": True, "coordinates": {"$exists": True}},
        {"name": 1, "bloodGroup": 1, "coordinates": 1, "location": 1, "preliminaryStatus": 1, "isAvailable": 1}
    ).limit(50)
    
    donors = []
    async for donor in cursor:
        donor["_id"] = str(donor["_id"])
        # Add random jitter to coordinates for privacy
        if donor.get("coordinates"):
             donor["coordinates"]["lat"] += random.uniform(-0.01, 0.01)
             donor["coordinates"]["lng"] += random.uniform(-0.01, 0.01)
        donors.append(donor)
        
    return {"success": True, "donors": donors}

@router.patch("/availability")
async def toggle_availability(user: dict = Depends(get_current_user)):
    db = get_database()
    current_status = user.get("isAvailable", False)
    new_status = not current_status
    
    from datetime import datetime
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "isAvailable": new_status,
            "lastAvailableChangedAt": datetime.utcnow()
        }}
    )
    
    return {"success": True, "isAvailable": new_status}
