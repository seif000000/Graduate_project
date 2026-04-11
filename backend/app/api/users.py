from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List, Optional
from app.db.database import get_session
from app.models.user import User, UserRead, UserUpdate
from app.models.medicine import Donation
from app.models.notification import Notification
from app.models.report import UserReport
from app.api.deps import get_current_active_user, get_current_admin

router = APIRouter(prefix="/users", tags=["users"])

# ─── Profile ───────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserRead)
def get_my_profile(current_user: User = Depends(get_current_active_user)):
    """Get the current user's own profile."""
    return current_user

@router.patch("/me", response_model=UserRead)
def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Update current user's profile (name, email, pharmacy fields)."""
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.post("/me/verify-documents")
async def upload_verification_documents(
    full_name: str = Form(...),
    phone: str = Form(None),
    address: str = Form(None),
    front_id: UploadFile = File(None),
    back_id: UploadFile = File(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Handle upload of verification documents and update user profile info."""
    if full_name:
        current_user.full_name = full_name
    if address:
        current_user.pharmacy_address = address
        
    session.add(current_user)
    session.commit()
    
    # Ideally save front_id and back_id to a storage bucket here.
    return {"message": "تم استلام مستندات التوثيق بنجاح، وسيتم مراجعتها قريباً."}

# ─── Admin: List / Block Users ──────────────────────────────────────────────

@router.get("/", response_model=List[UserRead])
def list_all_users(
    role: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin: list all users, optionally filtered by role."""
    statement = select(User)
    if role:
        statement = statement.where(User.role == role)
    return session.exec(statement).all()

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin: permanently delete a user account."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    session.delete(user)
    session.commit()
    return {"message": "تم حذف المستخدم بنجاح"}

# ─── Pharmacy Stats ──────────────────────────────────────────────────────────

@router.get("/pharmacy/stats")
def get_pharmacy_stats(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Pharmacy: get dispensing stats for the current pharmacy user."""
    if current_user.role not in ("pharmacy", "admin"):
        raise HTTPException(status_code=403, detail="غير مسموح")

    donations = session.exec(
        select(Donation).where(Donation.donor_id == current_user.id)
    ).all()

    total = len(donations)
    delivered = sum(1 for d in donations if d.status == "delivered")
    available = sum(1 for d in donations if d.status == "available")

    return {
        "total_dispensed": delivered,
        "total_available": available,
        "total_items": total,
        "completion_rate": round((delivered / total * 100) if total else 0, 1),
    }

# ─── Admin: Platform-wide Stats ─────────────────────────────────────────────

@router.get("/admin/stats")
def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin: platform-wide aggregate stats."""
    total_users   = len(session.exec(select(User)).all())
    total_donors  = len(session.exec(select(User).where(User.role == "user")).all())
    total_pharmacies = len(session.exec(select(User).where(User.role == "pharmacy")).all())
    total_donations = len(session.exec(select(Donation)).all())
    delivered = len(session.exec(select(Donation).where(Donation.status == "delivered")).all())

    return {
        "total_users": total_users,
        "total_donors": total_donors,
        "total_pharmacies": total_pharmacies,
        "total_donations": total_donations,
        "total_delivered": delivered,
        "success_rate": round((delivered / total_donations * 100) if total_donations else 0, 1),
    }

# ─── Notifications ─────────────────────────────────────────────────────────

@router.get("/me/notifications", response_model=List[Notification])
def get_my_notifications(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Fetch all notifications for the current user."""
    statement = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc())
    return session.exec(statement).all()

@router.post("/me/notifications/read-all")
def mark_notifications_read(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Mark all notifications as read for the current user."""
    notifications = session.exec(
        select(Notification).where(Notification.user_id == current_user.id, Notification.is_new == True)
    ).all()
    for n in notifications:
        n.is_new = False
        session.add(n)
    session.commit()
    return {"message": "تم تحديث كافة التنبيهات"}

# ─── Reports ──────────────────────────────────────────────────────────────

@router.get("/admin/reports", response_model=List[UserReport])
def get_all_reports(
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Fetch all user reports for admin review."""
    statement = select(UserReport).order_by(UserReport.created_at.desc())
    return session.exec(statement).all()

@router.post("/me/report", response_model=UserReport)
def create_report(
    report: UserReport,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Submit a new user report."""
    report.user_id = current_user.id
    session.add(report)
    session.commit()
    session.refresh(report)
    return report
