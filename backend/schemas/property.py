from pydantic import BaseModel, Field


class PropertyBase(BaseModel):
    location: str = Field(min_length=1, max_length=255)
    sqft: float = Field(gt=0)
    bhk: int = Field(ge=1, le=20)
    bathrooms: int = Field(ge=1, le=20)
    parking: int = Field(default=0, ge=0, le=20)
    amenities: str = ""
    price: float | None = None
    image_url: str = ""


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    location: str | None = None
    sqft: float | None = None
    bhk: int | None = None
    bathrooms: int | None = None
    parking: int | None = None
    amenities: str | None = None
    price: float | None = None
    image_url: str | None = None


class PropertyOut(PropertyBase):
    id: int
    owner_id: int | None

    class Config:
        from_attributes = True
