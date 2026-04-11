from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class MedicineRequestBase(SQLModel):
    medicine_name: str
    urgency: str = "متوسطة" # قصوى, عالية, متوسطة
    description: Optional[str] = None
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "pending" # pending, fulfilled, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MedicineRequest(MedicineRequestBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    requester_id: int = Field(foreign_key="user.id")
    
    requester: "User" = Relationship(back_populates="requests")
    responses: List["RequestResponse"] = Relationship(back_populates="request")

class RequestResponse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    request_id: int = Field(foreign_key="medicinerequest.id")
    responder_id: int = Field(foreign_key="user.id")
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    request: "MedicineRequest" = Relationship(back_populates="responses")

class MedicineRequestCreate(MedicineRequestBase):
    pass
