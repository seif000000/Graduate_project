from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class MedicineBase(SQLModel):
    name: str = Field(index=True)
    generic_name: Optional[str] = Field(default=None, index=True)
    manufacturer: Optional[str] = None
    category: Optional[str] = None # tablets, syrup, injection, etc.

class Medicine(MedicineBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    donations: List["Donation"] = Relationship(back_populates="medicine")

class DonationBase(SQLModel):
    quantity: str
    expiry_date: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "available" # available, reserved, delivered
    is_near_expiry: bool = False
    batch_info: Optional[str] = None
    price: str = "مجاني" # or a numeric price
    added_at: datetime = Field(default_factory=datetime.utcnow)

class Donation(DonationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    donor_id: int = Field(foreign_key="user.id")
    medicine_id: int = Field(foreign_key="medicine.id")
    
    donor: "User" = Relationship(back_populates="donations")
    medicine: "Medicine" = Relationship(back_populates="donations")

class DonationCreate(DonationBase):
    medicine_name: str
    generic_name: Optional[str] = None
