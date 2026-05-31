from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.user import User
from app.models.medicine import Donation, Medicine
from app.models.request import MedicineRequest
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/me")
def get_my_dashboard(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    donation_rows = session.exec(
        select(Donation, Medicine)
        .join(Medicine)
        .where(Donation.donor_id == current_user.id)
        .order_by(Donation.added_at.desc())
    ).all()

    total_donations = len(donation_rows)
    delivered_donations = sum(1 for d, _ in donation_rows if d.status == "delivered")

    requests = session.exec(
        select(MedicineRequest)
        .where(MedicineRequest.requester_id == current_user.id)
        .order_by(MedicineRequest.created_at.desc())
    ).all()

    total_requests = len(requests)
    trust_level = "100%" if current_user.is_verified else "50%"

    recent_history = []

    for d, m in donation_rows[:3]:
        recent_history.append({
            "type": "تبرع",
            "name": m.name,
            "date": d.added_at.strftime("%Y-%m-%d"),
            "status": "تم الاستلام" if d.status == "delivered" else "قيد المعالجة"
        })

    for r in requests[:3]:
        recent_history.append({
            "type": "طلب",
            "name": r.medicine_name,
            "date": r.created_at.strftime("%Y-%m-%d"),
            "status": "مكتمل" if r.status == "fulfilled" else "قيد المعالجة"
        })

    recent_history = sorted(recent_history, key=lambda x: x["date"], reverse=True)[:5]

    return {
        "stats": {
            "total_donations": str(total_donations),
            "lives_saved": str(delivered_donations),
            "total_requests": str(total_requests),
            "trust_level": trust_level
        },
        "recent_history": recent_history
    }
