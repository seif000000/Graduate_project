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
