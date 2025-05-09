from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime, timezone, timedelta
import uuid
import os
from dotenv import dotenv_values

if os.getenv("ENV") != "production":
    config = dotenv_values(".env")
    for key, value in config.items():
        os.environ.setdefault(key, value)

IST = timezone(timedelta(hours=5, minutes=30))

DB_USER = os.getenv("DB_LOCAL_USER")
DB_PASSWORD = os.getenv("DB_LOCAL_PASSWORD")
DB_HOST = os.getenv("DB_LOCAL_HOST")
DB_PORT = os.getenv("DB_LOCAL_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base = declarative_base()

# --- Models ---

class FDTeam(Base):
    __tablename__ = "fd_team"
    team_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=lambda: datetime.now(IST), nullable=False)

class FDProjectRegistry(Base):
    __tablename__ = "fd_project_registry"
    project_uuid = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_name = Column(String(255), nullable=False)
    team_id = Column(String(36), ForeignKey("fd_team.team_id", ondelete="CASCADE"), nullable=False)
    production_url = Column(String(255), nullable=True)
    pre_production_url = Column(String(255), nullable=True)
    playground_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(IST), nullable=False)

    team = relationship("FDTeam", backref="projects")

    __table_args__ = (
        Index("idx_project_name", "project_name"),
        UniqueConstraint("team_id", "project_name", name="uq_team_project"),
    )

class FDActivityLog(Base):
    __tablename__ = "fd_activity_log"
    log_uuid = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    log_message = Column(String(255), nullable=False)
    log_timestamp = Column(DateTime, default=lambda: datetime.now(IST), nullable=False)
    team_id = Column(String(36), ForeignKey("fd_team.team_id", ondelete="CASCADE"), nullable=False)
    team = relationship("FDTeam", backref="activity_logs")

    __table_args__ = (
        Index("idx_log_timestamp", "log_timestamp"),
    )

Base.metadata.create_all(bind=engine)
