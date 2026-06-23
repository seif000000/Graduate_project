from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone

class FeedbackBase(SQLModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Feedback(FeedbackBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", description="The user who wrote the feedback")
    target_id: int = Field(foreign_key="user.id", description="The user/pharmacy receiving the feedback")
    donation_id: Optional[int] = Field(default=None, foreign_key="donation.id")
    request_id: Optional[int] = Field(default=None, foreign_key="medicinerequest.id")

class FeedbackCreate(FeedbackBase):
    target_id: int
    donation_id: Optional[int] = None
    request_id: Optional[int] = None
