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
    """Simple Enum for Yes/No fields."""

    YES = "Yes"
    NO = "No"


class HiLo(enum.Enum):
    """Simple Enum for High/Low fields."""

    HIGH = "High"
    LOW = "Low"


class Base(DeclarativeBase):
    pass


# "DATA" table models


class Sample(Base):
    __tablename__ = "samples"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String(16))
    pscid: Mapped[str] = mapped_column(String(16))
    sampling_date: Mapped[date] = mapped_column(Date, nullable=True)
    psc: Mapped[YesNo] = mapped_column(Enum(YesNo), nullable=True)
    cca: Mapped[YesNo] = mapped_column(Enum(YesNo), nullable=True)
    ibd: Mapped[YesNo] = mapped_column(Enum(YesNo), nullable=True)
    fibrosis: Mapped[HiLo] = mapped_column(Enum(HiLo), nullable=True)
    bilirubin: Mapped[HiLo] = mapped_column(Enum(HiLo), nullable=True)
    alp: Mapped[HiLo] = mapped_column(Enum(HiLo), nullable=True)

    variables: Mapped[List["Variable"]] = relationship(
        "Variable", secondary="measurements", back_populates="samples"
    )

    __table_args__ = (UniqueConstraint("type", "pscid"),)


class Variable(Base):
    """
    Variable table to store metabolite, miRNA, and protein names.
    The table is referenced by the measurements and base_stats tables.
    """

    __tablename__ = "variables"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(32), unique=True)

    samples: Mapped[List["Sample"]] = relationship(
        "Sample", secondary="measurements", back_populates="variables"
    )


class Measurement(Base):
    """Measurement table to store values for each sample and variable."""

    __tablename__ = "measurements"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sample_id: Mapped[int] = mapped_column(ForeignKey("samples.id"))
    variable_id: Mapped[int] = mapped_column(ForeignKey("variables.id"))
    value: Mapped[float] = mapped_column(Float)

    __table_args__ = (UniqueConstraint("variable_id", "sample_id"),)


# "STATS" table models


class BaseStats(Base):
    """Base statistics table to store common statistical measures."""

    __tablename__ = "base_stats"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    variable_id: Mapped[int] = mapped_column(ForeignKey("variables.id"))
    condition: Mapped[str] = mapped_column(
        String(16)
    )  # CCA, IBD, ALP, bilirubin, fibrosis

    # Common fields
    fold_change: Mapped[float] = mapped_column(Float)
    log2fc: Mapped[float] = mapped_column(Float, nullable=True)
    p_value: Mapped[float] = mapped_column(Float, nullable=True)
    auc: Mapped[float] = mapped_column(Float)
    adj_p_value: Mapped[float] = mapped_column(Float, nullable=True)

    # Median values (column names vary by condition)
    median_group1: Mapped[float] = mapped_column(
        Float
    )  # median_noCCA, median_noIBD, median_low_ALP
    median_group2: Mapped[float] = mapped_column(
        Float
    )  # median_CCA, median_IBD, median_high_ALP

    # Relationships
    metabolite_details: Mapped["MetaboliteStats"] = relationship(
        back_populates="base", uselist=False
    )
    mirna_details: Mapped["MiRNAStats"] = relationship(
        back_populates="base", uselist=False
    )
    protein_details: Mapped["ProteinStats"] = relationship(
        back_populates="base", uselist=False
    )

    __table_args__ = (UniqueConstraint("variable_id", "condition"),)


class MetaboliteStats(Base):
    """Metabolite-specific statistics table."""

    __tablename__ = "metabolite_stats"

    id: Mapped[int] = mapped_column(ForeignKey("base_stats.id"), primary_key=True)
    biochemical: Mapped[str] = mapped_column(String)
    pubchem: Mapped[str] = mapped_column(String, nullable=True)
    hmdb: Mapped[str] = mapped_column(String, nullable=True)
    super_pathway: Mapped[str] = mapped_column(String)
    sub_pathway: Mapped[str] = mapped_column(String)

    base: Mapped["BaseStats"] = relationship(back_populates="metabolite_details")


class MiRNAStats(Base):
    """miRNA-specific statistics table."""

    __tablename__ = "mirna_stats"

    id: Mapped[int] = mapped_column(ForeignKey("base_stats.id"), primary_key=True)
    base: Mapped["BaseStats"] = relationship(back_populates="mirna_details")


class ProteinStats(Base):
    """Protein-specific statistics table."""

    __tablename__ = "protein_stats"

    id: Mapped[int] = mapped_column(ForeignKey("base_stats.id"), primary_key=True)
    assay: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String, nullable=True)
    uniprot_id: Mapped[str] = mapped_column(String, nullable=True)

    base: Mapped["BaseStats"] = relationship(back_populates="protein_details")
