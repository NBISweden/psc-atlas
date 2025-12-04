import logging

from contextlib import contextmanager

from psc_atlas.engine import SessionLocal

logger = logging.getLogger(__name__)


@contextmanager
def get_session():
    """Provide a transactional scope around a series of operations."""
    with SessionLocal() as session, session.begin():
        yield session
