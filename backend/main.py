from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from core.limits import limiter
from sqlalchemy.orm import Session

from core.security import get_password_hash
from database.db import SessionLocal, engine
from database.models import Base, Property, User
from routes import admin, analytics, auth, prediction, properties


def seed_if_empty() -> None:
    db: Session = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add_all(
                [
                    User(
                        email="admin@example.com",
                        hashed_password=get_password_hash("Admin123!"),
                        full_name="Demo Admin",
                        role="admin",
                    ),
                    User(
                        email="user@example.com",
                        hashed_password=get_password_hash("User123!"),
                        full_name="Demo User",
                        role="user",
                    ),
                ]
            )
            db.commit()
        if db.query(Property).count() == 0:
            samples = [
                Property(
                    owner_id=None,
                    location="Downtown",
                    sqft=1450,
                    bhk=2,
                    bathrooms=2,
                    parking=1,
                    amenities="gym,concierge",
                    price=685000,
                ),
                Property(
                    owner_id=None,
                    location="Hills District",
                    sqft=2800,
                    bhk=4,
                    bathrooms=3,
                    parking=2,
                    amenities="pool,garden,garage",
                    price=1120000,
                ),
                Property(
                    owner_id=None,
                    location="Riverside",
                    sqft=1100,
                    bhk=2,
                    bathrooms=2,
                    parking=1,
                    amenities="river_view",
                    price=425000,
                ),
                Property(
                    owner_id=None,
                    location="Metro North",
                    sqft=950,
                    bhk=1,
                    bathrooms=1,
                    parking=0,
                    amenities="transit",
                    price=315000,
                ),
            ]
            db.add_all(samples)
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_if_empty()
    yield


app = FastAPI(title="House Price AI API", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(prediction.router)
app.include_router(analytics.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"service": "house-price-ai", "docs": "/docs"}
