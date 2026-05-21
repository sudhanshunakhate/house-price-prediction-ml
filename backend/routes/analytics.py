from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from api.deps import get_current_user
from database.db import get_db
from database.models import PredictionLog, Property, User
from services import ml_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    props = db.query(Property).all()
    total = len(props)
    avg_price = db.query(func.avg(Property.price)).filter(Property.price.isnot(None)).scalar()
    by_loc: dict[str, dict] = defaultdict(lambda: {"count": 0, "sum_sqft": 0.0, "sum_price": 0.0, "n_price": 0})
    for p in props:
        bl = by_loc[p.location]
        bl["count"] += 1
        bl["sum_sqft"] += p.sqft
        if p.price:
            bl["sum_price"] += p.price
            bl["n_price"] += 1
    locations = []
    for loc, v in by_loc.items():
        avg_p = (v["sum_price"] / v["n_price"]) if v["n_price"] else None
        locations.append(
            {
                "location": loc,
                "count": v["count"],
                "avg_sqft": round(v["sum_sqft"] / max(v["count"], 1), 1),
                "avg_price": round(avg_p, 2) if avg_p else None,
            }
        )
    locations.sort(key=lambda x: x["count"], reverse=True)

    preds = db.query(PredictionLog).order_by(PredictionLog.id.desc()).limit(200).all()
    trend = []
    for pr in reversed(preds[-30:]):
        trend.append({"id": pr.id, "predicted_price": pr.predicted_price, "location": pr.location})

    bundle = ml_service.load_bundle()
    return {
        "property_count": total,
        "avg_listed_price": float(avg_price) if avg_price else None,
        "by_location": locations[:12],
        "prediction_trend": trend,
        "model_train_r2": bundle.get("train_r2"),
        "reference_localities": bundle.get("localities", []),
    }


@router.get("/heatmap")
def heatmap_data(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Simplified heatmap: location -> avg predicted recent."""
    rows = (
        db.query(
            PredictionLog.location,
            func.avg(PredictionLog.predicted_price),
            func.count(PredictionLog.id),
        )
        .group_by(PredictionLog.location)
        .all()
    )
    return [
        {"location": r[0], "avg_predicted": round(float(r[1]), 2), "samples": r[2]}
        for r in rows
    ]
