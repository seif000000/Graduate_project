from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class MedicalReportBase(SQLModel):
    name: str
    type: str
    size: str
    file_url: Optional[str] = None
    date: str

class MedicalReport(MedicalReportBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MedicalReportCreate(MedicalReportBase):
    pass

class MedicationLogBase(SQLModel):
    med: str
    note: str
    date: str

class MedicationLog(MedicationLogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MedicationLogCreate(MedicationLogBase):
    pass
