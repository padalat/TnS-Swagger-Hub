from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
import uuid
from datetime import datetime

# Define MySQL connection URL (MySQL is running in Docker)
DATABASE_URL = "mysql+pymysql://root:root@127.0.0.1:3307/tnsswagger"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=True, future=True)

# Create a configured "SessionLocal" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to provide database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Define declarative base
Base = declarative_base()

# ORM model for projectInfo table
class ProjectInfo(Base):
    __tablename__ = "projectInfo"
    uuid = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    projectname = Column(String(255), nullable=False)
    projecturl = Column(String(255), nullable=False)
    create_time = Column(DateTime, default=datetime.utcnow)

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)
