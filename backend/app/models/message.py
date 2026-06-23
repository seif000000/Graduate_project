from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class MessageBase(SQLModel):
    text: str
    receiver_id: int

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="user.id")
    receiver_id: int = Field(foreign_key="user.id")
    text: str
    status: str = Field(default="sent") # sent, read
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(MessageBase):
    pass
