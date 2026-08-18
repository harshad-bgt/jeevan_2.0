from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.config.database import get_database
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/entities")
async def get_all_entities(
    role: Optional[str] = Query(None, description="Filter by role (donor, hospital, bloodbank)"),
    user: dict = Depends(get_current_user)
):
    """
    Returns all registered users (donors, hospitals, blood banks).
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access admin resources")
        
    db = get_database()
    query = {}
    if role and role != "all":
        query["role"] = role
        
    cursor = db.users.find(query).sort("createdAt", -1)
    
    entities = []
    async for entity in cursor:
        entity["_id"] = str(entity["_id"])
        entities.append(entity)
        
    return {"success": True, "data": entities}

@router.get("/requests")
async def get_all_requests(
    user: dict = Depends(get_current_user)
):
    """
    Returns all registered blood requests.
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access admin resources")
        
    db = get_database()
    
    cursor = db.requests.find({}).sort("createdAt", -1)
    
    requests = []
    async for req in cursor:
        req["_id"] = str(req["_id"])
        requests.append(req)
        
    return {"success": True, "data": requests}

@router.get("/summary")
async def get_admin_summary(
    user: dict = Depends(get_current_user)
):
    """
    Returns quick counts for admin dashboard KPI cards.
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access admin resources")
        
    db = get_database()
    
    donors_count = await db.users.count_documents({"role": "donor"})
    hospitals_count = await db.users.count_documents({"role": "hospital"})
    bloodbanks_count = await db.users.count_documents({"role": "bloodbank"})
    active_requests_count = await db.requests.count_documents({"status": "pending"})
    
    return {
        "success": True, 
        "summary": {
            "donors": donors_count,
            "hospitals": hospitals_count,
            "bloodBanks": bloodbanks_count,
            "activeRequests": active_requests_count
        }
    }
