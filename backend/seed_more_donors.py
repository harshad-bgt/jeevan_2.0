import asyncio
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

# Load env variables first
load_dotenv()

from app.config.database import get_database
from seed_db import INDIAN_NAMES, LOCATIONS, BLOOD_GROUPS, get_random_dob, get_random_hemoglobin

async def seed_more_donors():
    db = get_database()
    
    users = []
    phone_counter = 1000 # To ensure unique safe phones like 0000001000
    
    print("Generating donors to ensure every blood group is in every city...")
    for city in LOCATIONS:
        for blood_group in BLOOD_GROUPS:
            name = random.choice(INDIAN_NAMES)
            
            # Add slight jitter to coordinates
            jitter_lat = random.uniform(-0.05, 0.05)
            jitter_lng = random.uniform(-0.05, 0.05)
            
            safe_phone = f"000000{phone_counter:04d}"
            phone_counter += 1
            
            user = {
                "firebaseUid": f"dummy2_{phone_counter}_{random.randint(1000, 9999)}",
                "email": f"dummy2_{phone_counter}@example.com",
                "role": "donor",
                "name": name,
                "phone": safe_phone,
                "location": city["name"],
                "coordinates": {
                    "lat": city["lat"] + jitter_lat,
                    "lng": city["lng"] + jitter_lng
                },
                "bloodGroup": blood_group,
                "isAvailable": True, # Make them available so they show on the map!
                "dob": get_random_dob().isoformat(),
                "gender": random.choice(["Male", "Female"]),
                "weight": random.randint(50, 100),
                "hemoglobin": get_random_hemoglobin(),
                "currentHealthCondition": "Healthy",
                "majorMedicalConditions": ["None"],
                "currentMedications": "None",
                "recentIllnessOrSurgery": False,
                "recentTattooOrPiercing": False,
                "pregnancyStatus": "Not Applicable",
                "donationType": "Whole Blood",
                "lastDonationDate": (datetime.now() - timedelta(days=random.randint(100, 400))).isoformat(),
                "preliminaryStatus": "Eligible",
                "preliminaryReasons": [],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            users.append(user)
            
    print("Inserting into MongoDB...")
    await db.users.insert_many(users)
    print(f"Successfully seeded {len(users)} users. Now every city has every blood group!")

if __name__ == "__main__":
    asyncio.run(seed_more_donors())
