import asyncio
from datetime import datetime, timezone
import random
from dotenv import load_dotenv

load_dotenv()
from app.config.database import get_database

LOCATIONS = [
    {"name": "Mumbai, Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"name": "Delhi", "lat": 28.7041, "lng": 77.1025},
    {"name": "Bangalore, Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"name": "Hyderabad, Telangana", "lat": 17.3850, "lng": 78.4867},
    {"name": "Ahmedabad, Gujarat", "lat": 23.0225, "lng": 72.5714},
    {"name": "Chennai, Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"name": "Kolkata, West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"name": "Surat, Gujarat", "lat": 21.1702, "lng": 72.8311},
    {"name": "Pune, Maharashtra", "lat": 18.5204, "lng": 73.8567},
    {"name": "Jaipur, Rajasthan", "lat": 26.9124, "lng": 75.7873},
]

HOSPITAL_NAMES = [
    "Apollo Main Hospital", "Fortis Escorts Heart Institute", "Max Super Speciality",
    "Medanta - The Medicity", "Manipal Hospital", "Narayana Multispeciality",
    "AIIMS", "Lilavati Hospital", "Kokilaben Dhirubhai Ambani Hospital",
    "Breach Candy Hospital", "Tata Memorial Centre", "KIMS Hospitals",
    "Sir H. N. Reliance Foundation Hospital", "Christian Medical College",
    "Artemis Hospitals", "Sahyadri Super Speciality Hospital", "Deenanath Mangeshkar Hospital",
    "Ruby Hall Clinic", "Kauvery Hospital", "Care Hospitals"
]

BLOOD_BANK_NAMES = [
    "Red Cross Blood Bank", "Rotary Blood Bank", "Lion's Club Blood Center",
    "Jeevan Blood Bank", "Sankalp Blood Bank", "Prathama Blood Centre",
    "Think Foundation Blood Bank", "Navjeevan Blood Bank", "Sanjeevani Blood Bank",
    "LifeLine Blood Centre", "Aarohi Blood Bank", "State Government Blood Bank",
    "City Central Blood Bank", "Hope Blood Center", "Aayush Blood Bank",
    "Arpan Blood Bank", "Maheshwari Blood Bank", "Reliance Blood Bank",
    "Care and Cure Blood Bank", "Metro Blood Center"
]

CONTACT_NAMES = [
    "Dr. Ramesh Gupta", "Dr. Shalini Singh", "Dr. Amit Verma", "Dr. Kavita Desai",
    "Dr. Vikram Sharma", "Mr. Rajesh Kumar", "Mrs. Sunita Patel", "Dr. Prakash Iyer"
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

def get_random_phone():
    return str(random.choice([6, 7, 8, 9])) + "".join([str(random.randint(0, 9)) for _ in range(9)])

async def seed_institutions():
    db = get_database()
    users = []
    
    # Generate 15 Hospitals
    print("Generating 15 dummy hospitals...")
    for i in range(15):
        hosp_name = random.choice(HOSPITAL_NAMES)
        contact = random.choice(CONTACT_NAMES)
        location = random.choice(LOCATIONS)
        
        jitter_lat = random.uniform(-0.02, 0.02)
        jitter_lng = random.uniform(-0.02, 0.02)
        
        user = {
            "firebaseUid": f"hosp_{i}_{random.randint(1000, 9999)}",
            "email": f"info.{hosp_name.lower().replace(' ', '')}{i}@example.com",
            "role": "hospital",
            "name": contact,
            "hospitalName": hosp_name,
            "phone": get_random_phone(),
            "location": location["name"],
            "coordinates": {
                "lat": location["lat"] + jitter_lat,
                "lng": location["lng"] + jitter_lng
            },
            "registrationNumber": f"HOSP-REG-{random.randint(10000, 99999)}",
            "emergencyContactPerson": contact,
            "department": random.choice(["Emergency", "Blood Transfusion", "ICU", "Surgery"]),
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }
        users.append(user)
        
    # Generate 15 Blood Banks
    print("Generating 15 dummy blood banks...")
    for i in range(15):
        bb_name = random.choice(BLOOD_BANK_NAMES)
        contact = random.choice(CONTACT_NAMES)
        location = random.choice(LOCATIONS)
        
        jitter_lat = random.uniform(-0.02, 0.02)
        jitter_lng = random.uniform(-0.02, 0.02)
        
        # Generate random available units
        available_units = {bg: random.randint(0, 50) for bg in BLOOD_GROUPS}
        
        user = {
            "firebaseUid": f"bb_{i}_{random.randint(1000, 9999)}",
            "email": f"contact.{bb_name.lower().replace(' ', '')}{i}@example.com",
            "role": "bloodbank",
            "name": contact,
            "bloodBankName": bb_name,
            "phone": get_random_phone(),
            "location": location["name"],
            "coordinates": {
                "lat": location["lat"] + jitter_lat,
                "lng": location["lng"] + jitter_lng
            },
            "licenseNumber": f"BB-LIC-{random.randint(10000, 99999)}",
            "operatingHours": "24/7",
            "availableUnits": available_units,
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }
        users.append(user)

    print("Inserting into MongoDB...")
    await db.users.insert_many(users)
    print(f"Successfully seeded {len(users)} institutions!")

if __name__ == "__main__":
    asyncio.run(seed_institutions())
