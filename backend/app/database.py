# ============================================
# Clinderma SkinVision — MongoDB Connection
# Uses Motor (async pymongo) for FastAPI
# ============================================

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI: str = os.getenv(
    "MONGO_URI",
    "mongodb+srv://pranavdawange03_db_user:PooRvWWkyCMUZv6c@cluster0.04asfc5.mongodb.net/clinderma?retryWrites=true&w=majority&appName=Cluster0",
)
MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "clinderma")

# Single shared client — created once on startup
client: AsyncIOMotorClient = None
db = None
scans_collection = None


def connect_db():
    """Initialize Motor client. Called from app lifespan startup."""
    global client, db, scans_collection
    client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[MONGO_DB_NAME]
    scans_collection = db["scans"]
    print(f"[MongoDB] Connected → {MONGO_DB_NAME}")


def close_db():
    """Close Motor client. Called from app lifespan shutdown."""
    global client
    if client:
        client.close()
        print("[MongoDB] Connection closed")
