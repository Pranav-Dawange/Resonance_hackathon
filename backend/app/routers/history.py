# ============================================
# Clinderma SkinVision — History Router
# GET /api/history/{user_id}   — last 20 scans
# GET /api/history/{user_id}/{scan_id} — single scan
# DELETE /api/history/{user_id}/{scan_id}
# ============================================

from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app import database

router = APIRouter()


def _serialize(doc: dict) -> dict:
    """Convert MongoDB _id ObjectId to string for JSON serialization."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("/history/{user_id}")
async def get_history(user_id: str, limit: int = 20):
    """
    Fetch the last `limit` scans for a given user_id,
    sorted newest-first.
    """
    cursor = (
        database.scans_collection.find({"user_id": user_id})
        .sort("timestamp", -1)
        .limit(limit)
    )
    scans = [_serialize(doc) async for doc in cursor]
    return {"user_id": user_id, "count": len(scans), "scans": scans}


@router.get("/history/{user_id}/{scan_id}")
async def get_scan(user_id: str, scan_id: str):
    """Fetch a single scan by its MongoDB document ID."""
    try:
        oid = ObjectId(scan_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid scan_id format")

    doc = await database.scans_collection.find_one({"_id": oid, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Scan not found")
    return _serialize(doc)


@router.delete("/history/{user_id}/{scan_id}")
async def delete_scan(user_id: str, scan_id: str):
    """Delete a single scan by its MongoDB document ID."""
    try:
        oid = ObjectId(scan_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid scan_id format")

    result = await database.scans_collection.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"deleted": True, "scan_id": scan_id}
