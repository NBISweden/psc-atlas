from fastapi import APIRouter

from pydantic import BaseModel
from typing import List, Optional

from sqlalchemy import distinct

from psc_atlas.session import get_session
from psc_atlas.models import Sample, YesNo, HiLo

router = APIRouter()


class SampleTypeResponse(BaseModel):
    types: List[str]


class Condition(BaseModel):
    name: str
    values: List[Optional[YesNo | HiLo]]


class SampleConditionsResponse(BaseModel):
    conditions: List[Condition]


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

    sample_types: List[str] = []
    with get_session() as session:
        result = session.query(distinct(Sample.type)).all()
        sample_types = [row[0] for row in result]
    return SampleTypeResponse(types=sample_types)


@router.get("/conditions")
def get_sample_conditions(type: str) -> SampleConditionsResponse:
    """
    Endpoint to retrieve available sample conditions for a given sample
    type.

    Parameters:
        type (str): The type of sample.

    Returns:
        SampleConditionsResponse: A response model containing a list of
        conditions applicable to the specified sample type.
    """

    # Note: Until the models are redone, this is a static response.

    sample_conditions: List[Condition] = [
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
    return SampleConditionsResponse(conditions=sample_conditions)
