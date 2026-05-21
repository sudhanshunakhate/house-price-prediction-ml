from pydantic import BaseModel, Field


class PredictIn(BaseModel):
    location: str = Field(min_length=1)
    sqft: float = Field(gt=0)
    bhk: int = Field(ge=1, le=20)
    bathrooms: int = Field(ge=1, le=20)
    parking: int = Field(default=0, ge=0, le=20)
    amenities: str = ""


class PredictOut(BaseModel):
    predicted_price: float
    confidence_score: float  # 0-1 heuristic from tree variance
    recommendation: str
    insights: list[str]
