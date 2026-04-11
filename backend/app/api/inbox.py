from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, or_, and_
from typing import List, Dict, Any
from ..db.database import get_session
from ..models.user import User
from ..models.message import Message, MessageCreate
from .deps import get_current_user

router = APIRouter()

@router.get("/chats")
def get_chats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Dynamic chat listing can be complex, for MVP we return a mock structure matching the UI
    return [
       { "id": 999, "name": "أحمد المتبرع (تجريبي)", "lastMsg": "تمام، هسيبلك الدواء...", "time": "10:30 ص", "unread": 0, "online": True },
       { "id": 888, "name": "صيدلية مسند المركزية", "lastMsg": "وصلت لنا كمية جديدة.", "time": "أمس", "unread": 0, "online": False }
    ]

@router.get("/messages/{user_id}")
def get_messages(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    messages = session.exec(
        select(Message).where(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
                and_(Message.sender_id == user_id, Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at.asc())
    ).all()
    
    if not messages:
        return [
           { "id": 1, "text": "أهلاً، كيف يمكنني مساعدتك؟", "sender": "them", "time": "09:00 ص", "status": "read" },
           { "id": 2, "text": "يرجى مراسلتي هنا للترتيب.", "sender": "them", "time": "09:05 ص", "status": "read" }
        ]
        
    res = []
    for m in messages:
        res.append({
            "id": m.id,
            "text": m.text,
            "sender": "me" if m.sender_id == current_user.id else "them",
            "time": m.created_at.strftime("%H:%M"),
            "status": m.status
        })
    return res

@router.post("/messages")
def send_message(
    msg_in: MessageCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    msg = Message(sender_id=current_user.id, receiver_id=msg_in.receiver_id, text=msg_in.text)
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return {
        "id": msg.id,
        "text": msg.text,
        "sender": "me",
        "time": msg.created_at.strftime("%H:%M"),
        "status": msg.status
    }
