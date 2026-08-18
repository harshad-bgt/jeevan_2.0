import asyncio
import os
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()
from app.config.database import get_database

FIREBASE_API_KEY = "AIzaSyB8We7dteKUMhlikaT-kkMnXY0gdxDDdls"
ADMIN_EMAIL = "admin@jeevan.org"
ADMIN_PASSWORD = "AdminPassword123"

async def create_admin():
    print(f"Creating admin user: {ADMIN_EMAIL}")
    
    # 1. Create user in Firebase Auth using REST API
    auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}"
    payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "returnSecureToken": True
    }
    
    try:
        res = requests.post(auth_url, json=payload)
        res.raise_for_status()
        data = res.json()
        firebase_uid = data["localId"]
        print(f"Successfully created Firebase user. UID: {firebase_uid}")
    except requests.exceptions.HTTPError as e:
        if "EMAIL_EXISTS" in res.text:
            print("Admin email already exists in Firebase. We will proceed to fetch the UID by logging in...")
            login_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
            login_res = requests.post(login_url, json=payload)
            login_res.raise_for_status()
            firebase_uid = login_res.json()["localId"]
            print(f"Logged in. UID: {firebase_uid}")
        else:
            print(f"Failed to create Firebase user: {res.text}")
            return
            
    # 2. Add admin user to MongoDB
    db = get_database()
    
    existing_admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing_admin:
        print("Admin user already exists in MongoDB. Updating role to admin...")
        await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {"role": "admin"}})
    else:
        admin_doc = {
            "firebaseUid": firebase_uid,
            "email": ADMIN_EMAIL,
            "role": "admin",
            "name": "System Administrator",
            "phone": "9999999999",
            "location": "Headquarters",
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }
        await db.users.insert_one(admin_doc)
        print("Successfully created Admin user in MongoDB!")

if __name__ == "__main__":
    asyncio.run(create_admin())
