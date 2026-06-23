import os
import sys
from sqlalchemy import text
from app.db.database import engine

def main():
    try:
        with engine.connect() as conn:
            # Check if columns exist first or just try except
            try:
                conn.execute(text('ALTER TABLE medicinerequest ADD COLUMN reserved_donation_id INTEGER;'))
                print("Added reserved_donation_id to medicinerequest")
            except Exception as e:
                print(e)
            
            try:
                conn.execute(text("ALTER TABLE donation ADD COLUMN type VARCHAR NOT NULL DEFAULT 'مجاني';"))
                print("Added type to donation")
            except Exception as e:
                print(e)
                
            try:
                conn.execute(text('ALTER TABLE donation ADD COLUMN base_price FLOAT;'))
                print("Added base_price to donation")
            except Exception as e:
                print(e)
                
            try:
                conn.execute(text('ALTER TABLE donation ADD COLUMN discount_percentage INTEGER;'))
                print("Added discount_percentage to donation")
            except Exception as e:
                print(e)
                
            conn.commit()
            print("Successfully executed ALTER TABLEs")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
