from fastapi import APIRouter, Depends, HTTPException, Body
from app.schemas.models import UserCreate
from app.config.database import get_database
from app.middleware.auth import get_current_user_token, get_current_user
from app.services.geocoding_service import geocode_address
from datetime import datetime

router = APIRouter()

@router.post("/register")
async def register_user(
    user_data: UserCreate,
    decoded_token: dict = Depends(get_current_user_token)
):
    db = get_database()
    
    # Ensure firebaseUid matches the token
    if user_data.firebaseUid != decoded_token.get("uid"):
        raise HTTPException(status_code=403, detail="Token mismatch")
        
    existing_user = await db.users.find_one({"firebaseUid": user_data.firebaseUid})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
        
    # Geocode location
    if user_data.location:
        try:
             coords = await geocode_address(user_data.location)
             user_data.coordinates = coords
        except Exception as e:
             pass
             
    user_dict = user_data.model_dump(exclude_unset=True)
    user_dict["createdAt"] = datetime.utcnow()
    user_dict["updatedAt"] = datetime.utcnow()
    
    result = await db.users.insert_one(user_dict)
    
    return {"success": True, "message": "User registered successfully", "userId": str(result.inserted_id)}

@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    user["_id"] = str(user["_id"])
    return {"success": True, "user": user}

@router.put("/profile")
async def update_profile(
    updates: dict = Body(...),
    user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Prevent updating immutable fields
    updates.pop("firebaseUid", None)
    updates.pop("_id", None)
    updates["updatedAt"] = datetime.utcnow()
    
    if "location" in updates and updates["location"] != user.get("location"):
         try:
             coords = await geocode_address(updates["location"])
             updates["coordinates"] = coords
         except:
             pass
             
    await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
    
    updated_user = await db.users.find_one({"_id": user["_id"]})
    updated_user["_id"] = str(updated_user["_id"])
    return {"success": True, "user": updated_user}

@router.post("/health-checkup")
async def add_health_checkup(
    checkup_data: dict = Body(...),
    user: dict = Depends(get_current_user)
):
    db = get_database()
    
    checkup_data["checkupDate"] = datetime.utcnow()
    
    # Simple preliminary status calculation based on basic rules
    status = "Eligible"
    if checkup_data.get("currentHealthCondition") != "Healthy":
        status = "Temporarily Deferred"
    if checkup_data.get("recentIllnessOrSurgery") or checkup_data.get("recentTattooOrPiercing"):
        status = "Temporarily Deferred"
        
    checkup_data["computedStatus"] = status
    
    updates = {
        "lastHealthCheckupDate": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "preliminaryStatus": status
    }
    
    # Sync core fields
    for field in ["weight", "hemoglobin", "currentHealthCondition", "majorMedicalConditions", "currentMedications", "recentIllnessOrSurgery", "recentTattooOrPiercing", "pregnancyStatus", "lastDonationDate", "donationType"]:
        if field in checkup_data:
            updates[field] = checkup_data[field]
            
    # If they are temporarily deferred, maybe add a reason
    reasons = []
    if status == "Temporarily Deferred":
        reasons.append("Deferred based on recent health checkup parameters.")
    updates["preliminaryReasons"] = reasons
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": updates,
            "$push": {
                "healthCheckupHistory": {
                    "$each": [checkup_data],
                    "$position": 0
                }
            }
        }
    )
    
    updated_user = await db.users.find_one({"_id": user["_id"]})
    updated_user["_id"] = str(updated_user["_id"])
    return {"success": True, "user": updated_user}

@router.put("/bloodbank-inventory")
async def update_bloodbank_inventory(
    inventory_data: dict = Body(...),
    user: dict = Depends(get_current_user)
):
    """
    Update blood unit inventory for hospitals and blood banks.
    Expected body: {"availableUnits": {"A+": 10, "B+": 5, ...}}
    """
    db = get_database()
    
    # Ensure only hospitals and blood banks can update inventory
    if user.get("role") not in ["hospital", "bloodbank"]:
        raise HTTPException(status_code=403, detail="Only hospitals and blood banks can manage inventory")
        
    available_units = inventory_data.get("availableUnits", {})
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "availableUnits": available_units,
            "updatedAt": datetime.utcnow()
        }}
    )
    
    return {"success": True, "message": "Inventory updated successfully"}
