from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_current_user
from database.db import get_db
from database.models import Property, User
from schemas.property import PropertyCreate, PropertyOut, PropertyUpdate

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=list[PropertyOut])
def list_properties(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Property)
    if user.role != "admin":
        q = q.filter((Property.owner_id == user.id) | (Property.owner_id.is_(None)))
    return q.order_by(Property.id.desc()).all()


@router.post("", response_model=PropertyOut)
def create_property(
    payload: PropertyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = Property(**payload.model_dump(), owner_id=user.id)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("/{prop_id}", response_model=PropertyOut)
def get_property(prop_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = db.query(Property).filter(Property.id == prop_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    if user.role != "admin" and p.owner_id not in (None, user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    return p


@router.patch("/{prop_id}", response_model=PropertyOut)
def update_property(
    prop_id: int,
    payload: PropertyUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = db.query(Property).filter(Property.id == prop_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    if user.role != "admin" and p.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{prop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(prop_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = db.query(Property).filter(Property.id == prop_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    if user.role != "admin" and p.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    db.delete(p)
    db.commit()
    return None
