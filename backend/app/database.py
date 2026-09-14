from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from .config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class FundManagerProfile(Base):
    """One row per firm (upserted on re-run)."""
    __tablename__ = "fund_managers"
    id = Column(Integer, primary_key=True)
    firm_name = Column(String(255), unique=True, index=True, nullable=False)
    firm_name_key = Column(String(255), unique=True, index=True, nullable=False)  # lower-cased dedupe key
    headquarters = Column(String(255), default="")
    geography_focus = Column(String(255), default="")
    aum_usd_m = Column(Float, nullable=True)          # numeric (millions USD) if extractable
    aum_display = Column(String(64), default="")      # raw string like "$1.2B"
    fund_vintages = Column(String(255), default="")   # comma-separated
    sectors = Column(String(512), default="")         # comma-separated
    stages = Column(String(255), default="")          # comma-separated
    profile_json = Column(Text, default="{}")         # full structured profile with per-field confidence + source
    findings_json = Column(Text, default="[]")        # raw research findings (fact + source url)
    profile_md = Column(Text, default="")
    summary = Column(String(1024), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
