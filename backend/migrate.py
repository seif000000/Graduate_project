"""Idempotent database migration for Musnad.

Run:  python migrate.py

1. Creates any missing tables from the SQLModel models (safe on existing DBs).
2. Adds any columns that were introduced after a table was first created
   (SQLModel's create_all does NOT alter existing tables, so we do it here).

Every ALTER is wrapped so re-running is safe: "already exists" errors are ignored.
"""
import sys
from sqlalchemy import text, inspect

from app.db.database import engine, init_db
import app.models  # noqa: F401  — import so every table is registered on metadata


# (table, column, SQL type/definition) — columns that may be missing on old DBs.
COLUMN_MIGRATIONS = [
    ("donation", "type", "VARCHAR NOT NULL DEFAULT 'مجاني'"),
    ("donation", "base_price", "FLOAT"),
    ("donation", "discount_percentage", "INTEGER"),
    ("medicinerequest", "reserved_donation_id", "INTEGER"),
    ("medicalreport", "file_url", "VARCHAR"),
    ("user", "is_active", "BOOLEAN NOT NULL DEFAULT TRUE"),
    ("user", "pharmacy_image_url", "VARCHAR"),
]


def run():
    print("→ Creating any missing tables...")
    init_db()

    insp = inspect(engine)
    existing = set(insp.get_table_names())

    added, skipped = 0, 0
    with engine.begin() as conn:
        for table, column, coltype in COLUMN_MIGRATIONS:
            if table not in existing:
                # Table was just created by init_db() with the full schema.
                continue
            cols = {c["name"] for c in insp.get_columns(table)}
            if column in cols:
                skipped += 1
                continue
            try:
                conn.execute(text(f'ALTER TABLE "{table}" ADD COLUMN {column} {coltype};'))
                print(f"  ✓ added {table}.{column}")
                added += 1
            except Exception as e:  # pragma: no cover
                print(f"  • skip {table}.{column}: {e}")
                skipped += 1

    print(f"✓ Migration complete — {added} column(s) added, {skipped} already present.")


if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        print("Migration failed:", e)
        sys.exit(1)
