from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from config import settings

# Prioritize PostgreSQL (Supabase/Render), but fallback to SQLite for local ease
SQLALCHEMY_DATABASE_URL = settings["DATABASE_URL"]

# SQLite requires specific connect args. Postgres does not.
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # SQLAlchemy 1.4+ requires 'postgresql://' instead of legacy 'postgres://'
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    # Use NullPool to prevent connection errors with Supabase Transaction Pooler (Port 6543)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, poolclass=NullPool)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
