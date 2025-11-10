from os import getenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = getenv("DATABASE_URL", "sqlite:///vol/database/psc-atlas.db")

engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
