# ============================================
# Clinderma SkinVision — FastAPI Main Application
# ============================================

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analysis
from app.routers import history as history_router
from app.database import connect_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB on startup, close on shutdown."""
    connect_db()
    yield
    close_db()


app = FastAPI(
    title="Clinderma SkinVision API",
    description="Production-grade facial health screening diagnostic engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — allow frontend origin (localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(analysis.router, prefix="/api")
app.include_router(history_router.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Clinderma SkinVision Diagnostic Engine",
        "version": "1.0.0",
        "models": {
            "lesion_detector": "YOLOv11n-skin (demo)",
            "hyperpigmentation": "CIE LAB + K-Means",
            "iga_calculator": "Logarithmic IGA 0-4",
        },
        "database": "MongoDB Atlas (clinderma)",
    }

