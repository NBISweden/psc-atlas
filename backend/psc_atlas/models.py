from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy import Enum, String, Date, Float, ForeignKey, UniqueConstraint

from datetime import date
from typing import List

import enum


class YesNo(enum.Enum):
    YES = "yes"
    NO = "no"


class HiLo(enum.Enum):
    HIGH = "High"
    LOW = "Low"


class Base(DeclarativeBase):
    pass


class Sample(Base):
    __tablename__ = "samples"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String(16))
    pscid: Mapped[str] = mapped_column(String(16), nullable=True)
    sampling_date: Mapped[date] = mapped_column(Date, nullable=True)
    psc: Mapped[YesNo] = mapped_column(Enum(YesNo), nullable=True)
    cca: Mapped[YesNo] = mapped_column(Enum(YesNo), nullable=True)
    ibd: Mapped[YesNo] = mapped_column(Enum(YesNo), nullable=True)
    fibrosis: Mapped[HiLo] = mapped_column(Enum(HiLo), nullable=True)
    bilirubin: Mapped[HiLo] = mapped_column(Enum(HiLo), nullable=True)
    alp: Mapped[HiLo] = mapped_column(Enum(HiLo), nullable=True)

    measurements: Mapped[List["Measurement"]] = relationship(
        "Measurement", back_populates="sample", cascade="all, delete-orphan"
    )


class Measurement(Base):
    __tablename__ = "measurements"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sample_id: Mapped[int] = mapped_column(
        ForeignKey("samples.id"), nullable=False
    )
    protein: Mapped[str] = mapped_column(String(16), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)

    sample: Mapped["Sample"] = relationship(
        "Sample", back_populates="measurements"
    )

    __table_args__ = (UniqueConstraint("protein", "sample_id"),)
