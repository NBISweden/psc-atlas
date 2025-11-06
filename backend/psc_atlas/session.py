import logging

from contextlib import contextmanager

from psc_atlas.engine import SessionLocal

logger = logging.getLogger(__name__)


@contextmanager
def get_session():
    """Provide a transactional scope around a series of operations."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.exception("Session rollback because of exception")
        raise
    finally:
        session.close()
