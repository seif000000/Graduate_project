from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from ..db.database import get_session
from ..models.user import User
from ..models.medical_history import MedicalReport, MedicationLog, MedicalReportCreate, MedicationLogCreate
from .deps import get_current_user

router = APIRouter()

@router.get("/reports", response_model=List[MedicalReport])
def get_reports(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    reports = session.exec(select(MedicalReport).where(MedicalReport.user_id == current_user.id)).all()
    if not reports:
        r1 = MedicalReport(user_id=current_user.id, name='تحليل سكر التراكمي', date='2026-03-15', type='PDF', size='1.2 MB')
        r2 = MedicalReport(user_id=current_user.id, name='روشتة عيادة الباطنة (د. أحمد)', date='2026-02-01', type='JPG', size='2.4 MB')
        session.add(r1)
        session.add(r2)
        session.commit()
        session.refresh(r1)
        session.refresh(r2)
        reports = [r1, r2]
    return reports

@router.get("/logs", response_model=List[MedicationLog])
def get_logs(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    logs = session.exec(select(MedicationLog).where(MedicationLog.user_id == current_user.id)).all()
    if not logs:
        l1 = MedicationLog(user_id=current_user.id, med='Glucophage 850mg', note='صرف بخصم من صيدلية مسند', date='20 مارس 2026')
        l2 = MedicationLog(user_id=current_user.id, med='Concor 5mg', note='مبرع من مستخدم "فاعل خير"', date='15 فبراير 2026')
        session.add(l1)
        session.add(l2)
        session.commit()
        session.refresh(l1)
        session.refresh(l2)
        logs = [l1, l2]
    return logs

@router.post("/reports", response_model=MedicalReport)
def add_report(
    report_in: MedicalReportCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    report = MedicalReport(
        user_id=current_user.id,
        name=report_in.name,
        type=report_in.type,
        size=report_in.size,
        date=report_in.date,
        file_url=report_in.file_url,
    )
    session.add(report)
    session.commit()
    session.refresh(report)
    return report

@router.delete("/reports/{report_id}")
def delete_report(
    report_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    report = session.get(MedicalReport, report_id)
    if not report or report.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="المستند غير موجود")
    session.delete(report)
    session.commit()
    return {"message": "تم حذف المستند بنجاح"}
