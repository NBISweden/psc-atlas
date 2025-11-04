from contextlib import contextmanager

from psc_atlas.engine import SessionLocal


@contextmanager
def get_session():
    """Provide a transactional scope around a series of operations."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Session rollback because of exception: {e}")
        raise
    finally:
        session.close()
