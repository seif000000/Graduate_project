from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List, Dict, Any
from app.db.database import get_session
from app.models.user import User
from app.models.medicine import Donation
from app.models.request import MedicineRequest
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/me")
def get_my_dashboard(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Fetch user donations
    donations = session.exec(
        select(Donation).where(Donation.donor_id == current_user.id).order_by(Donation.created_at.desc())
    ).all()
    
    total_donations = len(donations)
    
    # Needs a way to calculate "Lives Saved", could just be total _delivered_ donations
    delivered_donations = sum(1 for d in donations if d.status == "delivered")
    
    # Fetch user requests
    requests = session.exec(
        select(MedicineRequest).where(MedicineRequest.requester_id == current_user.id).order_by(MedicineRequest.created_at.desc())
    ).all()
    
    total_requests = len(requests)
    
    # Trust Level (could be 100% or less if verified/not)
    trust_level = "100%" if current_user.is_verified else "50%"

    # Format recent history
    # We will combine top 5 recent from donations and requests
    recent_history = []
    
    for d in donations[:3]:
        recent_history.append({
            "type": "تبرع",
            "name": d.medicine_name,
            "date": d.created_at.strftime("%Y-%m-%d"),
            "status": "تم الاستلام" if d.status == "delivered" else "قيد المعالجة"
        })
        
    for r in requests[:3]:
        recent_history.append({
            "type": "طلب",
            "name": r.medicine_name,
            "date": r.created_at.strftime("%Y-%m-%d"),
            "status": "مكتمل" if r.status == "fulfilled" else "قيد المعالجة"
        })
        
    # Sort recent history by date descending (mock, since we just formatted strings)
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
