from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
import uuid
from datetime import datetime

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
    create_time = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)
