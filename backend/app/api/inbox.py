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
    from app.models.message import Message
    from app.models.user import User as DBUser
    
    # Get messages involving current user
    statement = select(Message).where(
        (Message.sender_id == current_user.id) | (Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.desc())
    messages = session.exec(statement).all()
    
    counterparty_ids = set()
    for m in messages:
        if m.sender_id != current_user.id:
            counterparty_ids.add(m.sender_id)
        if m.receiver_id != current_user.id:
            counterparty_ids.add(m.receiver_id)
            
    chats = []
    if counterparty_ids:
        users = session.exec(select(DBUser).where(DBUser.id.in_(list(counterparty_ids)))).all()
        user_map = {u.id: u for u in users}
        
        for cid in counterparty_ids:
            user = user_map.get(cid)
            if not user:
                continue
            last_m = next((m for m in messages if m.sender_id == cid or m.receiver_id == cid), None)
            last_text = last_m.text if last_m else ""
            last_time = last_m.created_at.strftime("%H:%M") if last_m else ""
            chats.append({
                "id": user.id,
                "name": user.full_name,
                "lastMsg": last_text,
                "time": last_time,
                "unread": 0,
                "online": True
            })
            
    if not chats:
        return [
           { "id": 999, "name": "أحمد المتبرع (تجريبي)", "lastMsg": "تمام، هسيبلك الدواء...", "time": "10:30 ص", "unread": 0, "online": True },
           { "id": 888, "name": "صيدلية مسند المركزية", "lastMsg": "وصلت لنا كمية جديدة.", "time": "أمس", "unread": 0, "online": False }
        ]
        
    return chats

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
    from app.models.notification import create_notification

    msg = Message(sender_id=current_user.id, receiver_id=msg_in.receiver_id, text=msg_in.text)
    session.add(msg)

    # Notify the recipient (e.g. a donor contacted about their medicine).
    if msg_in.receiver_id != current_user.id:
        create_notification(
            session,
            msg_in.receiver_id,
            "رسالة جديدة 💬",
            f"لديك رسالة جديدة من {current_user.full_name or 'مستخدم'}",
            type="info",
        )

    session.commit()
    session.refresh(msg)
    return {
        "id": msg.id,
        "text": msg.text,
        "sender": "me",
        "time": msg.created_at.strftime("%H:%M"),
        "status": msg.status
    }
