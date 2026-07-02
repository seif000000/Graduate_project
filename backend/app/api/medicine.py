from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List, Optional
from app.db.database import get_session
from app.models.medicine import Medicine, Donation, DonationCreate
from app.models.user import User
from app.models.feedback import Feedback
from app.api.deps import get_current_active_user


def get_ratings_map(session: Session, user_ids: list) -> dict:
    """Return {user_id: {"rating": avg, "count": n}} for the given target users."""
    ids = [uid for uid in set(user_ids) if uid is not None]
    if not ids:
        return {}
    rows = session.exec(
        select(Feedback.target_id, func.avg(Feedback.rating), func.count(Feedback.id))
        .where(Feedback.target_id.in_(ids))
        .group_by(Feedback.target_id)
    ).all()
    return {
        # pyrefly: ignore [unnecessary-type-conversion]
        tid: {"rating": round(float(avg), 1), "count": int(cnt)}
        for tid, avg, cnt in rows
    }

router = APIRouter(prefix="/medicine", tags=["medicine"])

@router.post("/donate", response_model=Donation)
def create_donation(
    donation_in: DonationCreate, 
    current_user: User = Depends(get_current_active_user), 
    session: Session = Depends(get_session)
):
    # 1. Check/Create Medicine entry
    medicine = session.exec(select(Medicine).where(Medicine.name == donation_in.medicine_name)).first()
    if not medicine:
        medicine = Medicine(name=donation_in.medicine_name, generic_name=donation_in.generic_name)
        session.add(medicine)
        session.commit()
        session.refresh(medicine)
    
    # 2. Create Donation entry
    db_donation = Donation(
        quantity=donation_in.quantity,
        expiry_date=donation_in.expiry_date,
        location=donation_in.location,
        latitude=donation_in.latitude,
        longitude=donation_in.longitude,
        is_near_expiry=getattr(donation_in, 'is_near_expiry', False),
        batch_info=getattr(donation_in, 'batch_info', None),
        donor_id=current_user.id,
        medicine_id=medicine.id,
        price=donation_in.price,
    )
    session.add(db_donation)
    session.commit()
    session.refresh(db_donation)
    return db_donation

@router.get("/inventory")
def get_inventory(q: Optional[str] = None, session: Session = Depends(get_session)):
    # Join Donation with Medicine for full info
    statement = select(Donation, Medicine).join(Medicine).where(Donation.status == "available")
    if q:
        statement = statement.where(Medicine.name.contains(q) | Medicine.generic_name.contains(q))
    
    results = session.exec(statement).all()
    ratings = get_ratings_map(session, [d.donor_id for d, _ in results])
    # Format the response
    return [
        {
            "id": d.id,
            "name": m.name,
            "generic_name": m.generic_name,
            "quantity": d.quantity,
            "expiry_date": d.expiry_date,
            "location": d.location,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "is_near_expiry": d.is_near_expiry,
            "batch_info": d.batch_info,
            "price": d.price,
            "added_at": d.added_at,
            "donor_id": d.donor_id,
            "donor_name": d.donor.full_name if d.donor else "متبرع فاعل خير",
            "donor_role": d.donor.role if d.donor else "user",
            "donor_verified": bool(d.donor.is_verified) if d.donor else False,
            "donor_rating": ratings.get(d.donor_id, {}).get("rating"),
            "donor_rating_count": ratings.get(d.donor_id, {}).get("count", 0),
        } for d, m in results
    ]

@router.get("/me", response_model=List[dict])
def get_my_donations(
    current_user: User = Depends(get_current_active_user), 
    session: Session = Depends(get_session)
):
    """Fetch all donations made by the current user."""
    statement = select(Donation, Medicine).join(Medicine).where(Donation.donor_id == current_user.id).order_by(Donation.added_at.desc())
    results = session.exec(statement).all()
    return [
        {
            "id": d.id,
            "name": m.name,
            "generic_name": m.generic_name,
            "quantity": d.quantity,
            "expiry_date": d.expiry_date,
            "location": d.location,
            "status": d.status,
            "price": d.price,
            "added_at": d.added_at
        } for d, m in results
    ]

@router.patch("/donation/{donation_id}")
def update_donation(
    donation_id: int,
    donation_update: dict,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Update a donation if it belongs to the current user."""
    db_donation = session.get(Donation, donation_id)
    if not db_donation or db_donation.donor_id != current_user.id:
        raise HTTPException(status_code=404, detail="التبرع غير موجود")
    
    for key, value in donation_update.items():
        if hasattr(db_donation, key):
            setattr(db_donation, key, value)
    
    session.add(db_donation)
    session.commit()
    session.refresh(db_donation)
    return db_donation

@router.delete("/donation/{donation_id}")
def delete_donation(
    donation_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a donation if it belongs to the current user and is still available."""
    db_donation = session.get(Donation, donation_id)
    if not db_donation or db_donation.donor_id != current_user.id:
        raise HTTPException(status_code=404, detail="التبرع غير موجود")
    
    session.delete(db_donation)
    session.commit()
    return {"message": "تم حذف التبرع بنجاح"}
