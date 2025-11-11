from os import getenv
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# The default database URL can be overridden by setting the DATABASE_URL
# environment variable.  The default uses a SQLite database located at
# "$HOME/vol/database/psc-atlas.db".
DATABASE_URL = getenv(
    "DATABASE_URL",
    f"sqlite:///{Path.home()}/vol/database/psc-atlas.db",
)

engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
