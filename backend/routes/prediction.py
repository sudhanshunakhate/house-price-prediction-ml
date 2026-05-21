from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_current_user
from database.db import get_db
from database.models import PredictionLog, Property, User
from schemas.prediction import PredictIn, PredictOut
from services import ml_service
from services.recommendation import build_recommendation

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("", response_model=PredictOut)
def predict(payload: PredictIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    feats = payload.model_dump()
    price, conf = ml_service.predict_vector(feats)
    rec, insights = build_recommendation(feats, price, conf)
    log = PredictionLog(
        user_id=user.id,
        location=payload.location,
        sqft=payload.sqft,
        bhk=payload.bhk,
        bathrooms=payload.bathrooms,
        parking=payload.parking,
        predicted_price=price,
    )
    db.add(log)
    db.commit()
    return PredictOut(
        predicted_price=round(price, 2),
        confidence_score=round(conf, 3),
        recommendation=rec,
        insights=insights,
    )
