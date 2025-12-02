from fastapi import APIRouter

from pydantic import BaseModel
from typing import List, Optional

from sqlalchemy import distinct
from sqlalchemy.orm import aliased

from psc_atlas.session import get_session
from psc_atlas.models import Sample
from psc_atlas.models import ConditionVariable, Condition
from psc_atlas.models import MeasurementVariable, Measurement

router = APIRouter()


class APICondition(BaseModel):
    name: str
    values: List[str]


class APIMeasurement(BaseModel):
    variable: str
    conditions: List[APICondition]
    values: List[float]


class SampleTypeResponse(BaseModel):
    types: List[str]


class SampleConditionResponse(BaseModel):
    conditions: List[APICondition]


class SampleVariableResponse(BaseModel):
    variables: List[str]


class SampleMeasurementResponse(BaseModel):
    measurements: List[APIMeasurement]


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
def get_sample_conditions(type: str) -> SampleConditionResponse:
    """
    Endpoint to retrieve condition variables and their values for
    samples of a specified type.

    Parameters:
        type (str): The sample type to filter by.
    Returns:
        SampleConditionResponse: A response model containing a list of
        conditions with their names and associated values.
    """

    conditions: List[APICondition] = []

    with get_session() as session:
        condition_variables = (
            session.query(ConditionVariable)
            .join(Condition)
            .join(Sample)
            .filter(Sample.type == type)
            .distinct()
            .all()
        )

        for condition_variable in condition_variables:
            values = (
                session.query(Condition.value)
                .join(ConditionVariable)
                .join(Sample)
                .filter(
                    Sample.type == type,
                    ConditionVariable.name == condition_variable.name,
                )
                .distinct()
                .all()
            )
            condition_values = [value[0] for value in values]
            conditions.append(
                APICondition(name=condition_variable.name, values=condition_values)
            )

    return SampleConditionResponse(conditions=conditions)


@router.get("/variables")
def get_sample_variables(
    type: str, contains: Optional[str] = None, limit: Optional[int] = None
) -> SampleVariableResponse:
    """
    Endpoint to retrieve measurement variables for samples of a specified type.

    Parameters:
        type (str): The sample type to filter by.
        contains (Optional[str]): A substring to filter variable names.
        limit (Optional[int]): Maximum number of variables to return.
    Returns:
        SampleVariableResponse: A response model containing a list of
        measurement variables.
    """

    variables: List[str] = []

    with get_session() as session:
        query = (
            session.query(MeasurementVariable)
            .join(Measurement)
            .join(Sample)
            .filter(Sample.type == type)
            .distinct()
        )
        if contains:
            query = query.filter(MeasurementVariable.name.contains(contains))
        if limit:
            query = query.limit(limit)

        measurement_variables = query.all()

        for measurement_variable in measurement_variables:
            variables.append(measurement_variable.name)

    return SampleVariableResponse(variables=variables)


@router.post("/measurements")
def get_sample_measurements(
    type: str, variable: str, conditions: List[APICondition]
) -> SampleMeasurementResponse:
    """
    Endpoint to retrieve measurements for samples of a specified type,
    filtered by conditions and a measurement variable.  The response is
    grouped by each condition's variable and value.

    Parameters:
        type (str): The sample type to filter by.
        variable (str): The measurement variable to filter by.
        conditions (List[APICondition]): A list of conditions to filter by.
    Returns:
        SampleMeasurementResponse: A response model containing a list of
        measurements with their variable, condition, and values.
    """

    measurements: List[APIMeasurement] = []

    with get_session() as session:
        # Build the base query, joining necessary tables and filtering
        # by sample type and measurement variable name.
        query = session.query(Measurement.value)
        query = query.join(MeasurementVariable)
        query = query.join(Sample)
        query = query.filter(Sample.type == type)
        query = query.filter(MeasurementVariable.name == variable)

        # Dynamically add joins and filters for each condition provided.
        i: int = 0
        for condition in conditions:
            i += 1
            # Create aliased tables for condition variable and condition
            # to allow multiple joins of the same table.
            condvar_alias = aliased(ConditionVariable, name="cv_" + str(i))
            cond_alias = aliased(Condition, name="c_" + str(i))

            # Add the condition variable name and condition value to the
            # selected columns.
            query = query.add_column(condvar_alias.name)
            query = query.add_column(cond_alias.value)

            # Join the aliased tables to the query, joining the
            # condition to the sample and the condition variable to the
            # condition.
            query = query.join(cond_alias, cond_alias.sample_id == Sample.id)
            query = query.join(
                condvar_alias, condvar_alias.id == cond_alias.condition_variable_id
            )

            # Apply filters for the condition variable name and values.
            query = query.filter(condvar_alias.name == condition.name)
            query = query.filter(cond_alias.value.in_(condition.values))

        result = query.order_by(Sample.id).all()
        measurement_dict: dict = {}

        for row in result:
            # The first element in the row is the measurement value.
            measurement_value = row[0]

            # The rest of the row contains pairs of condition variable
            # name and condition value; we need to keep track of these
            # to group the measurements correctly.
            condition_key = tuple((row[i], row[i + 1]) for i in range(1, len(row), 2))

            if condition_key not in measurement_dict:
                measurement_dict[condition_key] = []

            measurement_dict[condition_key].append(measurement_value)

        # Construct the response measurements from the grouped data.
        for condition_key, values in measurement_dict.items():
            api_conditions = [
                APICondition(name=cond_var, values=[cond_value])
                for cond_var, cond_value in condition_key
            ]

            measurements.append(
                APIMeasurement(
                    variable=variable,
                    conditions=api_conditions,
                    values=values,
                )
            )

    return SampleMeasurementResponse(measurements=measurements)
