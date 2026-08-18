import os
import json
import firebase_admin
from firebase_admin import credentials
import logging

logger = logging.getLogger(__name__)

def initialize_firebase():
    """
    Initializes the Firebase Admin SDK.
    """
    if firebase_admin._apps:
        # Already initialized
        return firebase_admin.get_app()

    try:
        logger.info("Initializing Firebase Admin SDK...")
        
        service_account_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
        
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
        else:
            # Try to build from environment variables
            project_id = os.environ.get("FIREBASE_PROJECT_ID")
            private_key = os.environ.get("FIREBASE_PRIVATE_KEY")
            client_email = os.environ.get("FIREBASE_CLIENT_EMAIL")
            
            if project_id and private_key and client_email:
                # Handle potential escaped newlines in the private key
                private_key = private_key.replace('\\n', '\n')
                
                cred_dict = {
                    "type": "service_account",
                    "project_id": project_id,
                    "private_key": private_key,
                    "client_email": client_email,
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
                cred = credentials.Certificate(cred_dict)
            else:
                logger.warning("Firebase Admin credentials not found! Authentication will fail.")
                return None
                
        app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully.")
        return app
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        return None
