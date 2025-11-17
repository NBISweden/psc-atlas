from fastapi import APIRouter

from pydantic import BaseModel
from typing import List

from sqlalchemy import distinct

from psc_atlas.session import get_session
from psc_atlas.models import Variable

router = APIRouter()


class VariableNameResponse(BaseModel):
    names: List[str]


@router.get("/names")
def get_variable_names(contains: str = None) -> VariableNameResponse:
    """
    Retrieve a list of distinct variable names from the database.

    Parameters:
        contains (str, optional): An optional filter. Only names that
        containthe filter string will be returned. The filter is
        containcase-insensitive.

    Returns:
        VariableNameResponse: A response model containing a list of
        variable names.
    """

    variable_names = []
    with get_session() as session:
        if contains:
            result = (
                session.query(distinct(Variable.name))
                .filter(Variable.name.contains(contains))
                .all()
            )
        else:
            result = session.query(distinct(Variable.name)).all()
        variable_names = [row[0] for row in result]
    return VariableNameResponse(names=variable_names)
