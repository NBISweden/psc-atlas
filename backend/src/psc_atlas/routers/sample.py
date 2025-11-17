from fastapi import APIRouter

from pydantic import BaseModel
from typing import List

from sqlalchemy import distinct

from psc_atlas.session import get_session
from psc_atlas.models import Sample

router = APIRouter()


class SampleTypeResponse(BaseModel):
    types: List[str]


@router.get("/types")
def get_sample_types() -> SampleTypeResponse:
    """
    Endpoint to retrieve distinct sample types from the database.

    Parameters:
        None

    Returns:
        SampleTypeResponse: A response model containing a list of
        distinct sample types.
    """

    sample_types: list[str] = []
    with get_session() as session:
        result = session.query(distinct(Sample.type)).all()
        sample_types = [row[0] for row in result]
    return SampleTypeResponse(types=sample_types)
