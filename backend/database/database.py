from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base
import uuid
from datetime import datetime, timezone, timedelta

# Define IST timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

DATABASE_URL = "mysql+pymysql://root:root@127.0.0.1:3307/tnsswagger"

engine = create_engine(DATABASE_URL, echo=True, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base = declarative_base()

class ProjectInfo(Base):
    __tablename__ = "projectInfo"
    uuid = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    projectname = Column(String(255), nullable=False)
    team_name = Column(String(255), nullable=False)  
    prod_url = Column(String(255),  nullable=True)
    pre_prod_url = Column(String(255),  nullable=True)
    pg_url = Column(String(255),  nullable=True)
    create_time = Column(DateTime, default=lambda: datetime.now(IST))

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    uuid = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(IST))
    project_uuid = Column(String(36), nullable=True)  # Removed ForeignKey constraint

Base.metadata.create_all(bind=engine)
