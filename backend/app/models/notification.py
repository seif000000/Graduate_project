from typing import Optional
from sqlmodel import SQLModel, Field, Relationship, Session
from datetime import datetime, timezone

class NotificationBase(SQLModel):
    title: str
    desc: str
    type: str = "info" # info, success, warning, badge
    is_new: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(NotificationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")

    # Relationship to user
    # user: "User" = Relationship(back_populates="notifications")


def create_notification(session: Session, user_id: int, title: str, desc: str, type: str = "info") -> "Notification":
    """Add a notification for a user to the session (the caller commits)."""
    n = Notification(user_id=user_id, title=title, desc=desc, type=type)
    session.add(n)
    return n
