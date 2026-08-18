import asyncio
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

# Load env variables first
load_dotenv()

from app.config.database import get_database

INDIAN_NAMES = [
    "Aarav Patel", "Vihaan Sharma", "Vivaan Singh", "Ananya Gupta",
    "Diya Reddy", "Advik Kumar", "Kavya Desai", "Myra Joshi",
    "Arjun Nair", "Sai Iyer", "Zara Menon", "Ishaan Verma",
    "Shaurya Das", "Ahana Bose", "Riya Mishra", "Kabir Roy",
    "Aadhya Mehta", "Dhruv Agarwal", "Anika Jain", "Reyansh Chauhan",
    "Aaradhya Yadav", "Atharva Pandey", "Prisha Thakur", "Rudra Pillai",
    "Aditi Kapoor", "Aryan Bhatia", "Kiara Shenoy", "Ayaan Gokhale",
    "Nisha Deshmukh", "Omkar Rane", "Sneha Kulkarni", "Yash Patil",
    "Shruti Shirke", "Vikram Rathore", "Pooja Hegde", "Rahul Chhetri",
    "Neha Mistry", "Karan Wadhwa", "Simran Kaur", "Harpreet Singh",
    "Siddharth Nambiar", "Meera Krishnan", "Rohan Bhatt", "Rishabh Ahluwalia",
    "Tanvi Soni", "Varun Thakur", "Priyanka Malhotra", "Gaurav Sehgal",
    "Swati Narayan", "Deepak Rao"
]

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
    {"name": "Lucknow, Uttar Pradesh", "lat": 26.8467, "lng": 80.9462},
    {"name": "Kanpur, Uttar Pradesh", "lat": 26.4499, "lng": 80.3319},
    {"name": "Nagpur, Maharashtra", "lat": 21.1458, "lng": 79.0882},
    {"name": "Indore, Madhya Pradesh", "lat": 22.7196, "lng": 75.8577},
    {"name": "Thane, Maharashtra", "lat": 19.2183, "lng": 72.9781},
    {"name": "Bhopal, Madhya Pradesh", "lat": 23.2599, "lng": 77.4126},
    {"name": "Visakhapatnam, Andhra Pradesh", "lat": 17.6868, "lng": 83.2185},
    {"name": "Patna, Bihar", "lat": 25.5941, "lng": 85.1376},
    {"name": "Vadodara, Gujarat", "lat": 22.3072, "lng": 73.1812},
    {"name": "Ghaziabad, Uttar Pradesh", "lat": 28.6692, "lng": 77.4538},
    {"name": "Ludhiana, Punjab", "lat": 30.9010, "lng": 75.8573},
    {"name": "Agra, Uttar Pradesh", "lat": 27.1767, "lng": 78.0081},
    {"name": "Nashik, Maharashtra", "lat": 20.0110, "lng": 73.7903},
    {"name": "Faridabad, Haryana", "lat": 28.4089, "lng": 77.3178},
    {"name": "Meerut, Uttar Pradesh", "lat": 28.9845, "lng": 77.7064},
    {"name": "Rajkot, Gujarat", "lat": 22.3039, "lng": 70.8022},
    {"name": "Varanasi, Uttar Pradesh", "lat": 25.3176, "lng": 82.9739},
    {"name": "Srinagar, Jammu and Kashmir", "lat": 34.0837, "lng": 74.7973},
    {"name": "Aurangabad, Maharashtra", "lat": 19.8762, "lng": 75.3433},
    {"name": "Dhanbad, Jharkhand", "lat": 23.7957, "lng": 86.4304}
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

def get_random_phone():
    return str(random.choice([6, 7, 8, 9])) + "".join([str(random.randint(0, 9)) for _ in range(9)])

def get_random_dob():
    # Donors aged 18 to 60
    start_date = datetime.now() - timedelta(days=60*365)
    end_date = datetime.now() - timedelta(days=18*365)
    days_between = (end_date - start_date).days
    random_number_of_days = random.randrange(days_between)
    return start_date + timedelta(days=random_number_of_days)

def get_random_hemoglobin():
    return round(random.uniform(12.0, 17.5), 1)

async def seed_database():
    db = get_database()
    
    users = []
    
    print("Generating 50 dummy donors...")
    for i in range(50):
        name = INDIAN_NAMES[i]
        location = random.choice(LOCATIONS)
        
        # Add slight jitter to coordinates so they don't stack perfectly on the map
        jitter_lat = random.uniform(-0.05, 0.05)
        jitter_lng = random.uniform(-0.05, 0.05)
        
        user = {
            "firebaseUid": f"dummy_{i}_{random.randint(1000, 9999)}",
            "email": f"{name.lower().replace(' ', '.')}@example.com",
            "role": "donor",
            "name": name,
            "phone": get_random_phone(),
            "location": location["name"],
            "coordinates": {
                "lat": location["lat"] + jitter_lat,
                "lng": location["lng"] + jitter_lng
            },
            "bloodGroup": random.choice(BLOOD_GROUPS),
            "isAvailable": random.choice([True, True, True, False]), # 75% available
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
            "donationType": random.choice(["Whole Blood", "Plasma", "First-Time Donor"]),
            "lastDonationDate": (datetime.now() - timedelta(days=random.randint(100, 400))).isoformat(),
            "preliminaryStatus": "Eligible",
            "preliminaryReasons": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        users.append(user)
        
    print("Inserting into MongoDB...")
    await db.users.insert_many(users)
    print(f"Successfully seeded {len(users)} users!")

if __name__ == "__main__":
    asyncio.run(seed_database())
