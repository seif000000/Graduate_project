from sqlmodel import Session, select
from app.db.database import engine, init_db
from app.models.user import User
from app.models.medicine import Medicine, Donation
from app.models.request import MedicineRequest, RequestResponse
from app.core.security import get_password_hash

def create_admin():
    init_db()
    with Session(engine) as session:
        # Check if admin already exists
        admin = session.exec(select(User).where(User.role == "admin")).first()
        if not admin:
            admin_user = User(
                email="admin@musnad.com",
                full_name="Admin Musnad",
                role="admin",
                is_verified=True,
                hashed_password=get_password_hash("admin123")
            )
            session.add(admin_user)
            session.commit()
            print("✅ Admin user created: admin@musnad.com / admin123")
        else:
            print("ℹ️ Admin user already exists.")

if __name__ == "__main__":
    create_admin()
