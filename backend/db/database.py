from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./db/house_twin.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Asset(Base):
    __tablename__ = "assets"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String(255), nullable=False)
    category       = Column(String(100))
    status         = Column(String(50), default="Good")
    location       = Column(String(255))
    brand          = Column(String(255))
    model          = Column(String(255))
    serial_number  = Column(String(255))
    install_date   = Column(String(20))
    warranty_expiry= Column(String(20))
    notes          = Column(Text)
    ifc_id         = Column(String(100))        # IFC expressID link
    ifc_global_id  = Column(String(100))        # IFC GlobalId (GUID)
    created_at     = Column(DateTime, default=datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class IFCModel(Base):
    __tablename__ = "ifc_models"

    id            = Column(Integer, primary_key=True, index=True)
    filename      = Column(String(255), nullable=False)
    file_path     = Column(String(512))
    element_count = Column(Integer)
    schema_version= Column(String(20))
    uploaded_at   = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
