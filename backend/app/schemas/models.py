from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class MongoBaseModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class UserCreate(BaseModel):
    firebaseUid: str
    email: EmailStr
    role: str
    name: str
    phone: str
    location: str
    coordinates: Optional[Dict[str, float]] = None
    
    bloodGroup: Optional[str] = None
    isAvailable: Optional[bool] = True
    
    hospitalName: Optional[str] = None
    registrationNumber: Optional[str] = None
    emergencyContactPerson: Optional[str] = None
    department: Optional[str] = None
    
    bloodBankName: Optional[str] = None
    licenseNumber: Optional[str] = None
    operatingHours: Optional[str] = None
    availableUnits: Optional[Dict[str, int]] = None
    
    dob: Optional[str] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    hemoglobin: Optional[float] = None
    currentHealthCondition: Optional[str] = None
    majorMedicalConditions: Optional[List[str]] = None
    currentMedications: Optional[str] = None
    recentIllnessOrSurgery: Optional[bool] = None
    recentTattooOrPiercing: Optional[bool] = None
    pregnancyStatus: Optional[str] = None
    donationType: Optional[str] = None
    lastDonationDate: Optional[str] = None
    preliminaryStatus: Optional[str] = "Pending"
    preliminaryReasons: Optional[List[str]] = None
    
    lastHealthCheckupDate: Optional[datetime] = None
    healthCheckupHistory: Optional[List[Dict[str, Any]]] = None

class UserResponse(MongoBaseModel, UserCreate):
    createdAt: datetime
    updatedAt: datetime

class BloodRequestCreate(BaseModel):
    patientName: str
    bloodGroup: str
    unitsRequired: int
    hospitalAddress: str
    urgency: str

class BloodRequestResponse(MongoBaseModel, BloodRequestCreate):
    requesterId: str
    status: str
    coordinates: Optional[Dict[str, float]] = None
    createdAt: datetime
    updatedAt: datetime

class NotificationCreate(BaseModel):
    userId: str
    requestId: str
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    
class NotificationResponse(MongoBaseModel, NotificationCreate):
    isRead: bool = False
    createdAt: datetime

class MatchResult(BaseModel):
    donorId: str
    donorName: str
    distanceKm: float
    bloodGroup: str
    aiMatchScore: float
    status: str = "pending"
