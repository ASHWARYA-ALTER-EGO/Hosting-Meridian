from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime, Float, ForeignKey, Index,
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime
from .config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class FundManagerProfile(Base):
    __tablename__ = "fund_managers"
    id = Column(Integer, primary_key=True)
    firm_name = Column(String(255), unique=True, index=True, nullable=False)
    firm_name_key = Column(String(255), unique=True, index=True, nullable=False)
    headquarters = Column(String(255), default="")
    geography_focus = Column(String(255), default="")
    aum_usd_m = Column(Float, nullable=True)
    aum_display = Column(String(64), default="")
    fund_vintages = Column(String(255), default="")
    sectors = Column(String(512), default="")
    stages = Column(String(255), default="")
    profile_json = Column(Text, default="{}")
    findings_json = Column(Text, default="[]")
    profile_md = Column(Text, default="")
    summary = Column(String(1024), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    deals    = relationship("Deal",    back_populates="firm", cascade="all, delete-orphan")
    people   = relationship("Person",  back_populates="firm", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="firm", cascade="all, delete-orphan")


class Deal(Base):
    """First-class deal / activity record. Persisted from the structuring
    node's `notable_portfolio` and `recent_activity` outputs."""
    __tablename__ = "deals"
    id = Column(Integer, primary_key=True)
    firm_id = Column(Integer, ForeignKey("fund_managers.id"), index=True, nullable=False)
    company_name = Column(String(255), default="")
    company_name_key = Column(String(255), index=True, default="")   # normalised for overlap detection
    kind = Column(String(32), default="investment")                  # investment | fund_close | exit | leadership | other
    note = Column(Text, default="")
    date_str = Column(String(32), default="")                        # "2024", "2024-06", "2024-06-12", "Jun 2024"
    source_url = Column(String(1024), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    firm = relationship("FundManagerProfile", back_populates="deals")


class Person(Base):
    """Leadership / partners table, joined to a firm."""
    __tablename__ = "people"
    id = Column(Integer, primary_key=True)
    firm_id = Column(Integer, ForeignKey("fund_managers.id"), index=True, nullable=False)
    name = Column(String(255), default="")
    role = Column(String(255), default="")
    source_url = Column(String(1024), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    firm = relationship("FundManagerProfile", back_populates="people")


class Finding(Base):
    """Raw sourced facts from the research node. Kept as rows (not just JSON)
    so we can retrieve by keyword for the ask-this-profile chat."""
    __tablename__ = "findings"
    id = Column(Integer, primary_key=True)
    firm_id = Column(Integer, ForeignKey("fund_managers.id"), index=True, nullable=False)
    topic = Column(String(64), default="other")
    fact = Column(Text, default="")
    source_url = Column(String(1024), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    firm = relationship("FundManagerProfile", back_populates="findings")


Index("ix_deals_company_key", Deal.company_name_key)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
