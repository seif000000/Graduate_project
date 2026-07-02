from datetime import timezone
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class UserReportBase(SQLModel):
    subject: str
    description: str
    type: str = "medicine" # medicine, user, system
    priority: str = "medium" # low, medium, high
    status: str = "open" # open, investigating, resolved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserReport(UserReportBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    # reporter: "User" = Relationship(back_populates="reports_made")
