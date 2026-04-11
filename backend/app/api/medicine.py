from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.db.database import get_session
from app.models.medicine import Medicine, Donation, DonationCreate
from app.models.user import User
from app.api.deps import get_current_active_user

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
def get_inventory(q: str = None, session: Session = Depends(get_session)):
    # Join Donation with Medicine for full info
    statement = select(Donation, Medicine).join(Medicine).where(Donation.status == "available")
    if q:
        statement = statement.where(Medicine.name.contains(q) | Medicine.generic_name.contains(q))
    
    results = session.exec(statement).all()
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
            "added_at": d.added_at
        } for d, m in results
    ]
