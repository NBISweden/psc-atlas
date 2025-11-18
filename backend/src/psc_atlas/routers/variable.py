from fastapi import APIRouter

from pydantic import BaseModel
from typing import List

from sqlalchemy import distinct

from psc_atlas.session import get_session
from psc_atlas.models import Variable, Sample

router = APIRouter()


class VariableNameResponse(BaseModel):
    names: List[str]


@router.get("/names")
def get_variable_names(
    contains: str = None, limit: int = None, type: str = None
) -> VariableNameResponse:
    """
    Retrieve a list of distinct variable names from the database.

    Parameters:
        contains (str, optional): An optional filter. Only names that
        containthe filter string will be returned. The filter is
        containcase-insensitive.

        limit (int, optional): The maximum number of variable names to
        return. If not provided, all variable names matching the filter
        will be returned.

        type (str, optional): The type of samples associated with the
        variables. If provided, only variable names associated with
        samples of this type will be returned.

    Returns:
        VariableNameResponse: A response model containing a list of
        variable names.
    """

    variable_names = []
    with get_session() as session:
        query = session.query(distinct(Variable.name)).order_by(Variable.name)

        if type:
            query = query.filter(Variable.samples.any(Sample.type == type))
        if contains:
            query = query.filter(Variable.name.contains(contains))
        if limit:
            query = query.limit(limit)

        result = query.all()

        variable_names = [row[0] for row in result]

    return VariableNameResponse(names=variable_names)
