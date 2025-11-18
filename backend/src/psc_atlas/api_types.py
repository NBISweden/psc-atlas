from pydantic import BaseModel
from typing import List, Optional

from psc_atlas.models import Sample, YesNo, HiLo


class Condition(BaseModel):
    name: str
    values: List[Optional[YesNo | HiLo]]
