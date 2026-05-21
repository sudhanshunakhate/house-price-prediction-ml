from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from api.deps import get_current_admin
from database.db import get_db
from database.models import PredictionLog, Property, User
from schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(_: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    users = db.query(func.count(User.id)).scalar() or 0
    props = db.query(func.count(Property.id)).scalar() or 0
    preds = db.query(func.count(PredictionLog.id)).scalar() or 0
    return {"users": users, "properties": props, "predictions_logged": preds}


@router.get("/users", response_model=list[UserOut])
def list_users(_: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.asc()).all()


@router.patch("/users/{user_id}/role")
def set_role(user_id: int, role: str, _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    if role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.role = role
    db.commit()
    return {"ok": True, "id": user_id, "role": role}
