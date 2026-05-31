from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.medicine import Medicine, Donation
from app.models.user import User
from app.api.deps import get_current_active_user

router = APIRouter(tags=["inventory"])

@router.get("/pharmacy", response_model=List[dict])
def get_pharmacy_inventory(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    if current_user.role != "pharmacy" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مسموح لك بالوصول لهذا المخزون")
    
    # Join Donation with Medicine for full info
    statement = select(Donation, Medicine).join(Medicine).where(Donation.donor_id == current_user.id).order_by(Donation.added_at.desc())
    results = session.exec(statement).all()
    
    return [
        {
            "id": d.id,
            "medicine_name": m.name,
            "generic_name": m.generic_name,
            "quantity": d.quantity,
            "expiry_date": d.expiry_date,
            "location": d.location,
            "is_near_expiry": d.is_near_expiry,
            "batch_info": d.batch_info,
            "price": d.price,
            "added_at": d.added_at
        } for d, m in results
    ]

@router.get("/near-expiry", response_model=List[dict])
def get_near_expiry_medicine(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    if current_user.role != "pharmacy" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مسموح لك بالوصول لهذا القسم")
    
    # Join with Medicine and check expiry
    statement = select(Donation, Medicine).join(Medicine).where(
        Donation.donor_id == current_user.id,
        Donation.is_near_expiry == True
    )
    results = session.exec(statement).all()
    
    return [
        {
            "id": d.id,
            "medicine_name": m.name,
            "generic_name": m.generic_name,
            "quantity": d.quantity,
            "expiry_date": d.expiry_date,
            "location": d.location,
            "is_near_expiry": d.is_near_expiry,
            "batch_info": d.batch_info,
            "price": d.price,
            "added_at": d.added_at
        } for d, m in results
    ]

@router.post("/pharmacy", response_model=dict)
def add_to_inventory(
    medicine_in: dict,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Add a medicine to the pharmacy's inventory."""
    if current_user.role != "pharmacy" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مسموح لك بإضافة مخزون")
    
    # Check/Create Medicine entry
    medicine_name = medicine_in.get("medicine_name")
    medicine = session.exec(select(Medicine).where(Medicine.name == medicine_name)).first()
    if not medicine:
        medicine = Medicine(name=medicine_name, generic_name=medicine_in.get("generic_name"))
        session.add(medicine)
        session.commit()
        session.refresh(medicine)
    
    # Create Donation (as inventory item)
    db_item = Donation(
        quantity=medicine_in.get("quantity"),
        expiry_date=medicine_in.get("expiry_date"),
        location=medicine_in.get("location") or current_user.pharmacy_address or "غير محدد",
        donor_id=current_user.id,
        medicine_id=medicine.id,
        is_near_expiry=medicine_in.get("is_near_expiry", False),
        batch_info=medicine_in.get("batch_info"),
        price=medicine_in.get("price", "متوفر")
    )
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return {"message": "تمت إضافة الدواء للمخزون", "id": db_item.id}

@router.patch("/pharmacy/{item_id}")
def update_inventory_item(
    item_id: int,
    item_update: dict,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Update an inventory item."""
    db_item = session.get(Donation, item_id)
    if not db_item or db_item.donor_id != current_user.id:
        raise HTTPException(status_code=404, detail="الصنف غير موجود في مخزونك")
    
    for key, value in item_update.items():
        if hasattr(db_item, key):
            setattr(db_item, key, value)
    
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item

@router.delete("/pharmacy/{item_id}")
def delete_inventory_item(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete an inventory item."""
    db_item = session.get(Donation, item_id)
    if not db_item or db_item.donor_id != current_user.id:
        raise HTTPException(status_code=404, detail="الصنف غير موجود في مخزونك")
    
    session.delete(db_item)
    session.commit()
    return {"message": "تم حذف الصنف من المخزون بنجاح"}
