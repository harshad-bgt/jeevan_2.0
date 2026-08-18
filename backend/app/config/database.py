import os
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

# Initialize MongoDB client variable
client = None
db = None

def get_database():
    """
    Returns the database instance.
    """
    global client, db
    if db is not None:
        return db
        
    mongodb_url = os.environ.get("MONGODB_URL", "mongodb://localhost:27017/jeevan")
    
    try:
        logger.info("Connecting to MongoDB...")
        import certifi
        client = AsyncIOMotorClient(mongodb_url, tlsCAFile=certifi.where())
        # Verify connection
        client.admin.command('ping')
        logger.info("MongoDB connected successfully.")
        
        # Get database from connection string or default to 'jeevan'
        db_name = mongodb_url.split("/")[-1].split("?")[0] if "/" in mongodb_url else "jeevan"
        if db_name == "" or db_name.endswith(".net"):
             db_name = "jeevan"
        
        db = client[db_name]
        return db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

def close_mongo_connection():
    """
    Closes the MongoDB connection.
    """
    global client
    if client:
        logger.info("Closing MongoDB connection.")
        client.close()
