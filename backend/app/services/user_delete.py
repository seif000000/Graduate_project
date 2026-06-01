"""Cascade-delete a user and all rows that reference user.id."""
from typing import Optional

from sqlalchemy import or_
from sqlmodel import Session, select

from app.models.medical_history import MedicalReport, MedicationLog
from app.models.medicine import Donation
from app.models.message import Message
from app.models.notification import Notification
from app.models.report import UserReport
from app.models.request import MedicineRequest, RequestResponse
from app.models.user import User
from app.models.voucher import Voucher


def delete_user_cascade(session: Session, user_id: int) -> Optional[User]:
    user = session.get(User, user_id)
    if not user:
        return None

    request_ids = [
        r.id
        for r in session.exec(
            select(MedicineRequest).where(MedicineRequest.requester_id == user_id)
        ).all()
    ]

    if request_ids:
        for resp in session.exec(
            select(RequestResponse).where(RequestResponse.request_id.in_(request_ids))
        ).all():
            session.delete(resp)

    for resp in session.exec(
        select(RequestResponse).where(RequestResponse.responder_id == user_id)
    ).all():
        session.delete(resp)

    for req in session.exec(
        select(MedicineRequest).where(MedicineRequest.requester_id == user_id)
    ).all():
        session.delete(req)

    for donation in session.exec(
        select(Donation).where(Donation.donor_id == user_id)
    ).all():
        session.delete(donation)

    for report in session.exec(
        select(MedicalReport).where(MedicalReport.user_id == user_id)
    ).all():
        session.delete(report)

    for log in session.exec(
        select(MedicationLog).where(MedicationLog.user_id == user_id)
    ).all():
        session.delete(log)

    for notification in session.exec(
        select(Notification).where(Notification.user_id == user_id)
    ).all():
        session.delete(notification)

    for user_report in session.exec(
        select(UserReport).where(UserReport.user_id == user_id)
    ).all():
        session.delete(user_report)

    for voucher in session.exec(
        select(Voucher).where(Voucher.user_id == user_id)
    ).all():
        session.delete(voucher)

    for message in session.exec(
        select(Message).where(
            or_(Message.sender_id == user_id, Message.receiver_id == user_id)
        )
    ).all():
        session.delete(message)

    session.delete(user)
    session.flush()
    return user
