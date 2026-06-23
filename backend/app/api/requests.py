from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from app.db.database import get_session
from app.models.request import MedicineRequest, RequestResponse, MedicineRequestCreate
from app.models.user import User
from app.models.medicine import Donation
from app.api.deps import get_current_active_user, get_current_admin

router = APIRouter(prefix="/requests", tags=["requests"])

@router.post("/emergency", response_model=MedicineRequest)
def create_emergency_request(
    req_in: MedicineRequestCreate, 
    current_user: User = Depends(get_current_active_user), 
    session: Session = Depends(get_session)
):
    db_req = MedicineRequest(
        medicine_name=req_in.medicine_name,
        urgency=req_in.urgency,
        description=req_in.description,
        location=req_in.location,
        latitude=req_in.latitude,
        longitude=req_in.longitude,
        requester_id=current_user.id
    )
    session.add(db_req)
    session.commit()
    session.refresh(db_req)
    return db_req

@router.get("/me", response_model=List[MedicineRequest])
def get_my_requests(
    current_user: User = Depends(get_current_active_user), 
    session: Session = Depends(get_session)
):
    """Fetch all requests made by the current user."""
    statement = select(MedicineRequest).where(MedicineRequest.requester_id == current_user.id).order_by(MedicineRequest.created_at.desc())
    return session.exec(statement).all()

@router.get("/all", response_model=List[MedicineRequest])
def get_all_requests(session: Session = Depends(get_session)):
    """Fetch all medicine requests for the community board."""
    statement = select(MedicineRequest).order_by(MedicineRequest.created_at.desc())
    return session.exec(statement).all()

@router.get("/stats/analytics")
def get_medicine_analytics(
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """Fetch aggregate analytics for medicines."""
    # This would normally be complex SQL, here's a simplified version
    total_requests = session.exec(select(func.count(MedicineRequest.id))).one()
    total_donations = session.exec(select(func.count(Donation.id))).one()
    
    # Get top medicines (mocking logic but can be real with group_by)
    top_medicines = [
        {"name": "Insulin Glargine", "requests": 124, "available": 12, "status": "scarcity", "trend": "up"},
        {"name": "Glucophage 850mg", "requests": 88, "available": 41, "status": "stable", "trend": "down"},
        {"name": "Atorvastatin 40mg", "requests": 56, "available": 97, "status": "surplus", "trend": "up"},
    ]
    
    return {
        "total_requests": total_requests,
        "total_donations": total_donations,
        "success_rate": 84,
        "near_expiry_count": 15,
        "top_medicines": top_medicines
    }

@router.get("/emergency-board")
def get_emergency_board(session: Session = Depends(get_session)):
    statement = (
        select(MedicineRequest)
        .where(MedicineRequest.status == "pending")
        .order_by(MedicineRequest.created_at.desc())
    )
    results = session.exec(statement).all()
    board = []
    for req in results:
        session.refresh(req)
        board.append({
            "id": req.id,
            "medicine_name": req.medicine_name,
            "urgency": req.urgency,
            "description": req.description,
            "location": req.location,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "status": req.status,
            "created_at": req.created_at.isoformat(),
            "requester_id": req.requester_id,
            "responses": [
                {
                    "id": r.id,
                    "message": r.message,
                    "responder_id": r.responder_id,
                    "created_at": r.created_at.isoformat(),
                }
                for r in (req.responses or [])
            ],
        })
    return board

@router.post("/respond/{request_id}")
def respond_to_request(
    request_id: int, 
    message: str, 
    current_user: User = Depends(get_current_active_user), 
    session: Session = Depends(get_session)
):
    from app.models.request import RequestResponse
    response = RequestResponse(
        request_id=request_id,
        responder_id=current_user.id,
        message=message
    )
    session.add(response)
    session.commit()
    return {"message": "تم إرسال ردك بنجاح"}

@router.post("/approve/{request_id}")
def approve_request(
    request_id: int, 
    donation_id: int,
    current_user: User = Depends(get_current_active_user), 
    session: Session = Depends(get_session)
):
    from app.models.voucher import Voucher
    import uuid
    
    req = session.get(MedicineRequest, request_id)
    if not req or req.status != "pending":
        raise HTTPException(status_code=400, detail="الطلب غير موجود أو تمت الموافقة عليه مسبقاً")
        
    donation = session.get(Donation, donation_id)
    if not donation or donation.donor_id != current_user.id or donation.status != "available":
        raise HTTPException(status_code=400, detail="التبرع غير متاح أو لا تملكه")
        
    req.status = "approved"
    req.reserved_donation_id = donation.id
    donation.status = "reserved"
    
    session.add(req)
    session.add(donation)
    
    message = "تمت الموافقة على طلبك."
    # If a pharmacy approves, generate a voucher
    if current_user.role == "pharmacy":
        vid = f"VOU-{req.requester_id}-{str(uuid.uuid4())[:8].upper()}"
        voucher_type = donation.type if donation.type == "مجاني" else f"خصم {donation.discount_percentage}%"
        voucher = Voucher(
            id=vid,
            user_id=req.requester_id,
            pharmacy=current_user.full_name or "صيدلية",
            med=req.medicine_name,
            type=voucher_type,
            expiry=donation.expiry_date
        )
        session.add(voucher)
        message = "تم الموافقة وإصدار كوبون لك."
        
    session.commit()
    return {"message": message}

@router.post("/{request_id}/feedback")
def submit_feedback(
    request_id: int,
    rating: int = Query(..., ge=1, le=5),
    comment: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    from app.models.feedback import Feedback
    
    req = session.get(MedicineRequest, request_id)
    if not req or req.requester_id != current_user.id:
        raise HTTPException(status_code=404, detail="الطلب غير موجود أو لا تملكه")
    
    if req.status != "fulfilled":
        raise HTTPException(status_code=400, detail="لا يمكن التقييم إلا بعد الاستلام (fulfilled)")
        
    donation = session.get(Donation, req.reserved_donation_id)
    target_id = donation.donor_id if donation else req.responses[-1].responder_id if req.responses else 1
    
    fb = Feedback(
        user_id=current_user.id,
        target_id=target_id,
        donation_id=req.reserved_donation_id,
        request_id=request_id,
        rating=rating,
        comment=comment
    )
    session.add(fb)
    session.commit()
    return {"message": "تم إضافة التقييم بنجاح"}

@router.delete("/admin/request/{request_id}")
def admin_delete_request(
    request_id: int, 
    current_admin: User = Depends(get_current_admin), 
    session: Session = Depends(get_session)
):
    req = session.get(MedicineRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    session.delete(req)
    session.commit()
    return {"message": "تم حذف الطلب بواسطة الأدمن"}

@router.patch("/my-request/{request_id}")
def update_my_request(
    request_id: int,
    req_update: dict,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Update a request if it belongs to the current user."""
    db_req = session.get(MedicineRequest, request_id)
    if not db_req or db_req.requester_id != current_user.id:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    
    for key, value in req_update.items():
        if hasattr(db_req, key):
            setattr(db_req, key, value)
    
    session.add(db_req)
    session.commit()
    session.refresh(db_req)
    return db_req

@router.delete("/my-request/{request_id}")
def delete_my_request(
    request_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a request if it belongs to the current user."""
    db_req = session.get(MedicineRequest, request_id)
    if not db_req or db_req.requester_id != current_user.id:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    
    session.delete(db_req)
    session.commit()
    return {"message": "تم حذف الطلب بنجاح"}
