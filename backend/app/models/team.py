from typing import Optional
from sqlmodel import SQLModel, Field


class TeamMemberBase(SQLModel):
    name: str
    role: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    email: Optional[str] = None
    order: int = 0  # للترتيب


class TeamMember(TeamMemberBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class TeamMemberCreate(TeamMemberBase):
    pass


class TeamMemberUpdate(SQLModel):
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    email: Optional[str] = None
    order: Optional[int] = None
