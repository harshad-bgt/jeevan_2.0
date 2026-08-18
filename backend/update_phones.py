import asyncio
from dotenv import load_dotenv
load_dotenv()
from app.config.database import get_database

async def update():
    db = get_database()
    users = await db.users.find({}).to_list(None)
    count = 0
    
    for i, u in enumerate(users):
        if u.get("email") == "admin@jeevan.org":
            continue
            
        # Create a clearly fake 10-digit number starting with 000000
        fake_phone = f"+910000{str(i).zfill(6)}"
        
        await db.users.update_one({"_id": u["_id"]}, {"$set": {"phone": fake_phone}})
        
        if u.get("role") in ["bloodbank", "hospital"] and "contactDetails" in u:
            contact = u["contactDetails"]
            if "phone" in contact:
                contact["phone"] = fake_phone
                await db.users.update_one({"_id": u["_id"]}, {"$set": {"contactDetails": contact}})
        count += 1
        
    print(f"Updated {count} phone numbers to safe dummy numbers (e.g. +910000xxxxxx)")

asyncio.run(update())
