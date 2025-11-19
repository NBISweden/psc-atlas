from fastapi import APIRouter

from pydantic import BaseModel
from typing import List, Optional

from sqlalchemy import distinct
from sqlalchemy import or_

from psc_atlas.session import get_session
from psc_atlas.models import Sample, Variable, Measurement

router = APIRouter()


class APICondition(BaseModel):
    name: str
    values: List[Optional[str]]


class APIMeasurement(BaseModel):
    condition: APICondition
    values: List[float]


class MeasurementsResponse(BaseModel):
    measurements: List[APIMeasurement]


@router.post("/")
def get_measurements(
    type: str, variable: str, conditions: List[APICondition]
) -> MeasurementsResponse:
    """
    Endpoint to retrieve sample measurements based on sample type,
    variable, and the specified conditions.

    Parameters:
        type (str): The type of sample.
        variable (str): The variable for which measurements are to be
        retrieved.
        conditions (List[APICondition]): A list of conditions to filter the
        samples.

    Returns:
        MeasurementsResponse: A response model containing a list
        of measurements that match the specified criteria.
    """

    measurements: List[APIMeasurement] = []
    with get_session() as session:
        query = session.query(Measurement)
        query = query.join(Variable).filter(Variable.name == variable)
        query = query.join(Sample).filter(Sample.type == type)

        for condition in conditions:
            q = query

            if condition.name == "psc":
                q = q.filter(Sample.psc.in_(condition.values))
            elif condition.name == "cca":
                q = q.filter(Sample.cca.in_(condition.values))
            elif condition.name == "ibd":
                q = q.filter(Sample.ibd.in_(condition.values))
            elif condition.name == "fibrosis":
                q = q.filter(Sample.fibrosis.in_(condition.values))
            elif condition.name == "bilirubin":
                q = q.filter(Sample.bilirubin.in_(condition.values))
            elif condition.name == "alp":
                q = q.filter(Sample.alp.in_(condition.values))

            measurements.append(
                APIMeasurement(condition=condition, values=[m.value for m in q.all()])
            )

    return MeasurementsResponse(measurements=measurements)
