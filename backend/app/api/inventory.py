from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.medicine import Medicine, Donation
from app.models.user import User
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/pharmacy", response_model=List[Donation])
def get_pharmacy_inventory(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    if current_user.role != "pharmacy" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مسموح لك بالوصول لهذا المخزون")
    
    # In a real app, donations by a pharmacy are their inventory
    inventory = session.exec(
        select(Donation).where(Donation.donor_id == current_user.id)
    ).all()
    return inventory

@router.get("/near-expiry", response_model=List[Donation])
def get_near_expiry_medicine(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    if current_user.role != "pharmacy" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مسموح لك بالوصول لهذا القسم")
    
    # Simple logic: near_expiry flag is set, or we could check dates
    near_expiry = session.exec(
        select(Donation).where(
            Donation.donor_id == current_user.id,
            Donation.is_near_expiry == True
        )
    ).all()
    return near_expiry
