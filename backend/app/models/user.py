from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: str
    is_active: bool = True
    is_verified: bool = False # For pharmacies
    role: str = "user" # user, admin, pharmacy
    pharmacy_license: Optional[str] = None
    pharmacy_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    
    donations: List["Donation"] = Relationship(back_populates="donor")
    requests: List["MedicineRequest"] = Relationship(back_populates="requester")

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class UserUpdate(SQLModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
