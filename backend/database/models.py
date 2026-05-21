from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="")
    role = Column(String(32), default="user")  # user | admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    properties = relationship("Property", back_populates="owner")


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    location = Column(String(255), nullable=False)
    sqft = Column(Float, nullable=False)
    bhk = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    parking = Column(Integer, default=0)
    amenities = Column(Text, default="")  # comma-separated
    price = Column(Float, nullable=True)  # actual if known
    image_url = Column(String(512), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="properties")


class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    location = Column(String(255))
    sqft = Column(Float)
    bhk = Column(Integer)
    bathrooms = Column(Integer)
    parking = Column(Integer)
    predicted_price = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
