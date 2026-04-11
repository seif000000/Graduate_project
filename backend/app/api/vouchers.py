from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from ..db.database import get_session
from ..models.user import User
from ..models.voucher import Voucher, VoucherCreate, VoucherBase
from .deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=List[VoucherBase])
def get_my_vouchers(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    vouchers = session.exec(select(Voucher).where(Voucher.user_id == current_user.id)).all()
    # Initial seeding if user has no vouchers to show the UI
    if not vouchers:
        v1 = Voucher(id=f'VOU-{current_user.id}-001', user_id=current_user.id, pharmacy='صيدلية مسند المركزية', med='Insulin Glargine', type='مجاني', expiry='2026-12-31', status='active')
        v2 = Voucher(id=f'VOU-{current_user.id}-002', user_id=current_user.id, pharmacy='صيدلية الشفاء', med='Glucophage 850mg', type='خصم 50%', expiry='2026-11-15', status='active')
        session.add(v1)
        session.add(v2)
        session.commit()
        session.refresh(v1)
        session.refresh(v2)
        vouchers = [v1, v2]
        
    return vouchers

@router.post("/redeem/{voucher_id}")
def redeem_voucher(
    voucher_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    voucher = session.get(Voucher, voucher_id)
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher not found")
    if voucher.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if voucher.status == 'used':
        raise HTTPException(status_code=400, detail="Voucher already used")
        
    voucher.status = 'used'
    session.add(voucher)
    session.commit()
    return {"message": "Voucher redeemed successfully", "voucher": voucher}
