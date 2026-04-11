from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class VoucherBase(SQLModel):
    id: str = Field(primary_key=True)
    pharmacy: str
    med: str
    type: str # 'مجاني' or 'خصم 50%' etc.
    expiry: str
    status: str = Field(default="active") # 'active', 'used'

class Voucher(VoucherBase, table=True):
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VoucherCreate(SQLModel):
    id: str
    pharmacy: str
    med: str
    type: str
    expiry: str
