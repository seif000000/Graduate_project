import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
from ..db.database import get_session
from ..models.user import User
from ..models.voucher import Voucher, VoucherCreate, VoucherBase
from ..models.notification import create_notification
from .deps import get_current_user

router = APIRouter()


class VoucherIssue(BaseModel):
    recipient_email: str      # who the coupon is for
    med: str                  # medicine / offer name
    type: str                 # e.g. "مجاني" or "خصم 50%"
    expiry: str               # expiry date (string)


@router.get("/me", response_model=List[VoucherBase])
def get_my_vouchers(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    vouchers = session.exec(select(Voucher).where(Voucher.user_id == current_user.id)).all()
    return vouchers


@router.post("/", response_model=VoucherBase)
def create_voucher(
    payload: VoucherIssue,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """A verified pharmacy (or admin) issues a discount/free coupon to a specific user."""
    if current_user.role not in {"pharmacy", "admin"}:
        raise HTTPException(status_code=403, detail="غير مصرح لك بإصدار كوبونات")
    if current_user.role == "pharmacy" and not current_user.is_verified:
        raise HTTPException(status_code=403, detail="يجب توثيق الصيدلية قبل إصدار الكوبونات")

    recipient = session.exec(
        select(User).where(User.email == payload.recipient_email)
    ).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="لا يوجد مستخدم بهذا البريد الإلكتروني")

    vid = f"VOU-{recipient.id}-{str(uuid.uuid4())[:8].upper()}"
    voucher = Voucher(
        id=vid,
        user_id=recipient.id,
        pharmacy=current_user.full_name or "صيدلية",
        med=payload.med,
        type=payload.type,
        expiry=payload.expiry,
        status="active",
    )
    session.add(voucher)

    create_notification(
        session,
        recipient.id,
        "وصلك كوبون جديد 🎟️",
        f"أصدرت لك صيدلية «{current_user.full_name or 'صيدلية'}» كوبون {payload.type} على {payload.med}.",
        type="success",
    )

    session.commit()
    session.refresh(voucher)
    return voucher

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
