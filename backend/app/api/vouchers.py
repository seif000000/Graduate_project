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
