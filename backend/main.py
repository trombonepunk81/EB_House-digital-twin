from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from db.database import init_db
from api import assets, models, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    os.makedirs("models", exist_ok=True)
    os.makedirs("db", exist_ok=True)
    init_db()
    yield
    # Shutdown — nothing to clean up for now


app = FastAPI(
    title="EB House Digital Twin API",
    description="Backend API for the EB Residence digital twin platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(models.router, prefix="/api/models", tags=["Models"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
