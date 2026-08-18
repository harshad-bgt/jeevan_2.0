from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from app.config.firebase import initialize_firebase
from app.config.database import get_database
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()

# Initialize Firebase on load
initialize_firebase()

async def get_current_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the Firebase ID token and returns the decoded token payload.
    """
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verifying Firebase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(decoded_token: dict = Depends(get_current_user_token)):
    """
    Retrieves the user from the database based on the Firebase UID.
    """
    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    db = get_database()
    # Find user by firebaseUid
    user = await db.users.find_one({"firebaseUid": uid})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")
        
    return user

def require_roles(allowed_roles: list[str]):
    """
    Dependency generator to restrict access to specific roles.
    """
    async def role_checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {allowed_roles}"
            )
        return user
    return role_checker
