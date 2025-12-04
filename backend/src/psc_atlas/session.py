import logging

from contextlib import contextmanager

from psc_atlas.engine import SessionLocal

logger = logging.getLogger(__name__)


@contextmanager
def get_session():
    """Provide a transactional scope around a series of operations."""
    session = SessionLocal()
    try:
        with session.begin():
            yield session
    except Exception as e:
        logger.exception("Session rolled back due to an exception: %s", e)
        raise
    finally:
        session.close()
