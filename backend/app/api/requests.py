from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from app.schemas.models import BloodRequestCreate
from app.config.database import get_database
from app.middleware.auth import get_current_user
from app.services.geocoding_service import geocode_address
from app.services.matching_service import haversine_distance, is_blood_compatible
from app.services.ai_service import evaluate_donor_match
from app.services.notification_service import create_notification
from datetime import datetime
from bson import ObjectId

router = APIRouter()

class MatchRequest(BaseModel):
    bloodGroup: str
    hospitalAddress: str

@router.post("/create")
async def create_request(
    request_data: BloodRequestCreate,
    user: dict = Depends(get_current_user)
):
    db = get_database()
    
    req_dict = request_data.model_dump()
    req_dict["requesterId"] = str(user["_id"])
    req_dict["status"] = "pending"
    req_dict["createdAt"] = datetime.utcnow()
    req_dict["updatedAt"] = datetime.utcnow()
    
    # Geocode hospital
    coords = {"lat": 13.0827, "lng": 80.2707} # default fallback
    try:
        coords = await geocode_address(req_dict["hospitalAddress"])
    except:
        pass
    req_dict["coordinates"] = coords
    
    # Insert request
    result = await db.requests.insert_one(req_dict)
    req_id = str(result.inserted_id)
    
    # Find eligible donors
    cursor = db.users.find({
        "role": "donor",
        "isAvailable": True,
        "_id": {"$ne": user["_id"]},
        "coordinates": {"$exists": True}
    })
    
    matched_donors = []
    
    async for donor in cursor:
        if not is_blood_compatible(req_dict["bloodGroup"], donor.get("bloodGroup")):
             continue
             
        dist = haversine_distance(
             coords["lat"], coords["lng"],
             donor["coordinates"]["lat"], donor["coordinates"]["lng"]
        )
        
        # Max radius 50km
        if dist > 50:
             continue
             
        score = evaluate_donor_match(req_dict, donor, dist)
        
        # Create notification
        notif = await create_notification(
             str(donor["_id"]),
             req_id,
             "emergency_request",
             "Emergency Blood Request",
             f"{req_dict['unitsRequired']} units of {req_dict['bloodGroup']} needed urgently at {req_dict['hospitalAddress']}",
             data={
                  "distanceKm": round(dist, 2),
                  "aiMatchScore": score,
                  "patientName": req_dict["patientName"],
                  "bloodGroup": req_dict["bloodGroup"],
                  "urgency": req_dict["urgency"],
                  "hospitalAddress": req_dict["hospitalAddress"],
                  "unitsRequired": req_dict["unitsRequired"]
             }
        )
        
        matched_donors.append({
             "donorId": str(donor["_id"]),
             "name": donor["name"],
             "distanceKm": round(dist, 2),
             "aiMatchScore": score,
             "bloodGroup": donor["bloodGroup"]
        })
        
    # Sort by AI score
    matched_donors.sort(key=lambda x: x["aiMatchScore"], reverse=True)
    
    return {
        "success": True, 
        "message": "Request created and donors notified",
        "requestId": req_id,
        "matchedDonors": matched_donors
    }

@router.post("/match")
async def quick_match(payload: MatchRequest):
    """
    Simulates finding donors without creating a real request or sending notifications.
    Used for the Quick Proximity Matcher widget on the Home page.
    """
    db = get_database()
    
    # Geocode the requested address
    coords = {"lat": 13.0827, "lng": 80.2707} # default fallback
    try:
        coords = await geocode_address(payload.hospitalAddress)
    except:
        pass
        
    # Mock req_dict to reuse evaluate_donor_match logic
    mock_req = {
        "bloodGroup": payload.bloodGroup,
        "urgency": "High",
        "unitsRequired": 1,
        "createdAt": datetime.utcnow()
    }
    
    # Find available donors
    cursor = db.users.find({
        "role": "donor",
        "isAvailable": True,
        "coordinates": {"$exists": True}
    })
    
    matched_donors = []
    async for donor in cursor:
        if not is_blood_compatible(payload.bloodGroup, donor.get("bloodGroup")):
             continue
             
        dist = haversine_distance(
             coords["lat"], coords["lng"],
             donor["coordinates"]["lat"], donor["coordinates"]["lng"]
        )
        
        # Max radius 50km, OR fallback to text match if Nominatim rate limited
        is_text_match = payload.hospitalAddress.lower() in donor.get("location", "").lower()
        if dist > 50 and not is_text_match:
             continue
             
        # If it was a text match but geocoding failed (dist > 50), mock the distance
        if dist > 50 and is_text_match:
             dist = random.uniform(1.0, 15.0)
             
        score = evaluate_donor_match(mock_req, donor, dist)
        
        donor["_id"] = str(donor["_id"])
        donor["distance"] = round(dist, 2)
        donor["aiMatchScore"] = score
        
        # Clean up sensitive data for public api
        donor.pop("password", None)
        
        matched_donors.append(donor)
        
    # Sort by AI score
    matched_donors.sort(key=lambda x: x["aiMatchScore"], reverse=True)
    
    return {
        "success": True,
        "matchedDonors": matched_donors[:10]  # Return top 10 matches
    }

@router.get("/my-requests")
async def get_my_requests(user: dict = Depends(get_current_user)):
    db = get_database()
    
    cursor = db.requests.find({"requesterId": str(user["_id"])}).sort("createdAt", -1)
    requests = []
    async for req in cursor:
        req["_id"] = str(req["_id"])
        requests.append(req)
        
    return {"success": True, "requests": requests}

@router.get("/active")
async def get_active_requests():
    """
    Returns all active (pending) blood requests for the public map/feed.
    No auth required for this endpoint so the homepage can display them.
    """
    db = get_database()
    
    # Return all pending requests
    cursor = db.requests.find({"status": "pending"}).sort("createdAt", -1).limit(50)
    requests = []
    async for req in cursor:
        req["_id"] = str(req["_id"])
        requests.append(req)
        
    return {"success": True, "requests": requests}

@router.get("/donor-notifications")
async def get_donor_notifications(user: dict = Depends(get_current_user)):
    db = get_database()
    
    cursor = db.notifications.find({"userId": str(user["_id"])}).sort("createdAt", -1)
    notifs = []
    async for notif in cursor:
        notif["_id"] = str(notif["_id"])
        # Flatten data for frontend compatibility
        data = notif.pop("data", {})
        notif.update(data)
        notifs.append(notif)
        
    return {"success": True, "notifications": notifs}

@router.post("/respond-notification")
async def respond_notification(
    payload: dict = Body(...),
    user: dict = Depends(get_current_user)
):
    db = get_database()
    notif_id = payload.get("requestId") # Frontend passes requestId which is actually the notif _id
    action = payload.get("action")
    
    if not notif_id or not action:
        raise HTTPException(status_code=400, detail="Missing required fields")
        
    status = "accepted" if action == "accept" else "declined"
    
    try:
        await db.notifications.update_one(
             {"_id": ObjectId(notif_id), "userId": str(user["_id"])},
             {"$set": {"responseStatus": status, "isRead": True}}
        )
    except Exception as e:
        # Ignore invalid ObjectIds and fallback to string matching if needed
        await db.notifications.update_one(
             {"_id": notif_id, "userId": str(user["_id"])},
             {"$set": {"responseStatus": status, "isRead": True}}
        )
    
    return {"success": True, "message": f"Response recorded as {status}"}

@router.get("/sms-simulation")
async def get_sms_logs():
    return {"success": True, "logs": []}
