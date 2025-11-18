from fastapi import APIRouter

from pydantic import BaseModel
from typing import List

from sqlalchemy import distinct

from psc_atlas.session import get_session
from psc_atlas.models import Sample, YesNo, HiLo

router = APIRouter()


class Condition(BaseModel):
    name: str
    values: List[YesNo | HiLo | None]


class SampleTypeResponse(BaseModel):
    types: List[str]
    conditions: List[Condition] = [
        Condition(name="psc", values=[YesNo.YES, YesNo.NO, None]),
        Condition(name="cca", values=[YesNo.YES, YesNo.NO, None]),
        Condition(name="ibd", values=[YesNo.YES, YesNo.NO, None]),
        Condition(
            name="fibrosis",
            values=[HiLo.HIGH, HiLo.LOW, None],
        ),
        Condition(
            name="bilirubin",
            values=[HiLo.HIGH, HiLo.LOW, None],
        ),
        Condition(
            name="alp",
            values=[HiLo.HIGH, HiLo.LOW, None],
        ),
    ]


@router.get("/types")
def get_sample_types() -> SampleTypeResponse:
    """
    Endpoint to retrieve distinct sample types from the database.

    Parameters:
        None

    Returns:
        SampleTypeResponse: A response model containing a list of
        distinct sample types and the predefined conditions.
    """

    sample_types: list[str] = []
    with get_session() as session:
        result = session.query(distinct(Sample.type)).all()
        sample_types = [row[0] for row in result]
    return SampleTypeResponse(types=sample_types)
