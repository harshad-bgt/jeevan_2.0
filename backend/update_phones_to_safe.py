import asyncio
import os
from dotenv import load_dotenv

load_dotenv()
from app.config.database import get_database

async def update_phones():
    db = get_database()
    print("Connecting to database to update phone numbers...")
    
    # Get all users who aren't the admin
    cursor = db.users.find({"email": {"$ne": "admin@jeevan.org"}})
    
    count = 1
    async for user in cursor:
        # Generate a safe 10-digit number that starts with 000 (invalid in India)
        # Format: 0000000001, 0000000002, etc.
        safe_phone = f"000000{count:04d}"
        
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"phone": safe_phone}}
        )
        count += 1
        
    print(f"Successfully updated {count - 1} users with safe dummy phone numbers.")

if __name__ == "__main__":
    asyncio.run(update_phones())
