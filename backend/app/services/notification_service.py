import logging
from app.config.database import get_database
from datetime import datetime
from bson import ObjectId

logger = logging.getLogger(__name__)

async def create_notification(user_id: str, request_id: str, notif_type: str, title: str, message: str, data: dict = None):
    """
    Creates a notification in the database for a user.
    """
    db = get_database()
    
    notif = {
        "userId": user_id,
        "requestId": request_id,
        "type": notif_type,
        "title": title,
        "message": message,
        "data": data or {},
        "isRead": False,
        "createdAt": datetime.utcnow(),
        "responseStatus": "pending"
    }
    
    result = await db.notifications.insert_one(notif)
    notif["_id"] = str(result.inserted_id)
    return notif

async def send_push_notification(fcm_token: str, title: str, body: str, data: dict = None):
    """
    Stub for sending push notifications via Firebase Cloud Messaging (FCM).
    """
    logger.info(f"FCM Push -> {fcm_token}: {title} - {body}")
    pass

async def send_sms_alert(phone: str, body: str):
    """
    Stub for sending SMS alerts via Twilio or similar gateway.
    """
    logger.info(f"SMS Fallback -> {phone}: {body}")
    pass
