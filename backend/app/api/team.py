from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.team import TeamMember, TeamMemberCreate, TeamMemberUpdate
from app.api.deps import get_current_admin

router = APIRouter(prefix="/team", tags=["team"])


# ── Public: anyone can read ──────────────────────────────────
@router.get("/", response_model=list[TeamMember])
def get_team(session: Session = Depends(get_session)):
    """Returns all team members ordered by the `order` field."""
    members = session.exec(select(TeamMember).order_by(TeamMember.order)).all()
    return members


# ── Admin only ───────────────────────────────────────────────
@router.post("/", response_model=TeamMember)
def create_member(
    member_in: TeamMemberCreate,
    session: Session = Depends(get_session),
    _: object = Depends(get_current_admin),
):
    member = TeamMember(**member_in.model_dump())
    session.add(member)
    session.commit()
    session.refresh(member)
    return member


@router.patch("/{member_id}", response_model=TeamMember)
def update_member(
    member_id: int,
    member_in: TeamMemberUpdate,
    session: Session = Depends(get_session),
    _: object = Depends(get_current_admin),
):
    member = session.get(TeamMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="العضو غير موجود")
    for field, value in member_in.model_dump(exclude_none=True).items():
        setattr(member, field, value)
    session.add(member)
    session.commit()
    session.refresh(member)
    return member


@router.delete("/{member_id}")
def delete_member(
    member_id: int,
    session: Session = Depends(get_session),
    _: object = Depends(get_current_admin),
):
    member = session.get(TeamMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="العضو غير موجود")
    session.delete(member)
    session.commit()
    return {"ok": True}
