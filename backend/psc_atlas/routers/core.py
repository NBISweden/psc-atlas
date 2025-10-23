from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class SystemInformation(BaseModel):
    version: str
    id: str


@router.get("/")
def system_info() -> SystemInformation:
    return SystemInformation(
        version="0.0.1",
        id="psc-atlas"
    )
