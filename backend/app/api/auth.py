from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta
from app.db.database import get_session
from app.models.user import User, UserCreate, UserRead
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_admin

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_in.email)).first()
    if user:
        raise HTTPException(status_code=400, detail="الايميل مسجل مسبقاً")
    
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        is_verified=False if user_in.role == "pharmacy" else True,
        phone=user_in.phone,
        pharmacy_license=user_in.pharmacy_license if user_in.role == "pharmacy" else None,
        pharmacy_address=user_in.pharmacy_address if user_in.role == "pharmacy" else None,
        pharmacy_image_url=user_in.pharmacy_image_url if user_in.role == "pharmacy" else None,
        hashed_password=get_password_hash(user_in.password),
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    try:
        user = session.exec(select(User).where(User.email == form_data.username)).first()
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="الايميل أو كلمة المرور غير صحيحة",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(subject=user.email)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role,
            "full_name": user.full_name,
            "is_verified": user.is_verified,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/verify-pharmacy/{user_id}")
def verify_pharmacy(
    user_id: int, 
    current_admin: User = Depends(get_current_admin), 
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user or user.role != "pharmacy":
        raise HTTPException(status_code=404, detail="الصيدلية غير موجودة")
    user.is_verified = True
    session.add(user)
    session.commit()
    return {"message": "تم توثيق الصيدلية بنجاح"}

@router.get("/unverified-pharmacies", response_model=List[UserRead])
def get_unverified_pharmacies(
    current_admin: User = Depends(get_current_admin), 
    session: Session = Depends(get_session)
):
    pharmacies = session.exec(
        select(User).where(User.role == "pharmacy", User.is_verified == False)
    ).all()
    return pharmacies
