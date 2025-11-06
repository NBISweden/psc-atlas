import csv

from datetime import datetime
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from psc_atlas.models import YesNo, HiLo
from psc_atlas.models import Sample, Measurement, Variable
from psc_atlas.models import (
    BaseStats,
    MetaboliteStats,
    MiRNAStats,
    ProteinStats,
)

from psc_atlas.session import get_session


def parse_yes_no(value: str) -> YesNo | None:
    """Convert string to YesNo enum, or None for NA."""
    match value.strip().lower():
        case "na":
            return None
        case "yes":
            return YesNo.YES
        case "no":
            return YesNo.NO
        case _:
            raise ValueError(f"Invalid YesNo value: {value}")


def parse_hi_lo(value) -> HiLo | None:
    """Convert string to HiLo enum, or None for NA."""
    match value.strip().lower():
        case "na":
            return None
        case "high":
            return HiLo.HIGH
        case "low":
            return HiLo.LOW
        case _:
            raise ValueError(f"Invalid HiLo value: {value}")


def parse_date(value) -> datetime | None:
    """Convert YYYMMDD string to datetime object, or None for NA."""
    value = value.strip()
    match value.lower():
        case "na":
            return None
        case _:
            return datetime.strptime(value, "%Y%m%d")


def parse_string(value) -> str | None:
    """Convert string to str, or None for NA."""
    value = value.strip()
    match value.lower():
        case "na":
            return None
        case _:
            return value


def parse_float(value) -> float | None:
    """Convert string to float, or None for NA."""
    value = value.strip()
    match value.lower():
        case "na":
            return None
        case _:
            return float(value)


def load_data_file(file_path: Path):
    """
    Load data from CSV file.

    Args:
        file_path (Path): Path to the CSV file.

    Note that the "type" of the data is encoded in the filename, e.g.,
    "data_metabolites_PSC.csv" (for metabolite data).
    """

    data_type = file_path.stem.split("_")[1]  # Extract type from filename

    with file_path.open("r") as f:
        reader = csv.DictReader(f)

        sample_cols = {
            "PSCID",
            "sampling_date",
            "PSC",
            "CCA",
            "IBD",
            "Fibrosis",
            "Bilirubin",
            "ALP",
        }

        measurement_cols = set(reader.fieldnames or []) - sample_cols

        with get_session() as session:
            variable_cache = {}
            for name in measurement_cols:
                variable = (
                    session.query(Variable).filter_by(name=name).first()
                )
                if not variable:
                    variable = Variable(name=name)
                    session.add(variable)
                    session.flush()  # To get variable.id
                variable_cache[name] = variable.id

            for row in reader:
                # Create savepoint for IntegrityError handling.
                savepoint = session.begin_nested()

                try:
                    sample = Sample(
                        type=data_type,
                        pscid=parse_string(row["PSCID"]),
                        sampling_date=parse_date(row["sampling_date"]),
                        psc=parse_yes_no(row["PSC"]),
                        cca=parse_yes_no(row["CCA"]),
                        ibd=parse_yes_no(row["IBD"]),
                        fibrosis=parse_hi_lo(row["Fibrosis"]),
                        bilirubin=parse_hi_lo(row["Bilirubin"]),
                        alp=parse_hi_lo(row["ALP"]),
                    )
                    session.add(sample)
                    session.flush()  # To get sample.id

                    savepoint.commit()

                except IntegrityError:
                    # Rollback to savepoint on error (e.g., duplicate
                    # (type, pscid)).
                    savepoint.rollback()
                    print(
                        f"*** Skipping duplicate sample entry for PSCID {row['PSCID']} of type {data_type}."
                    )
                    continue

                for name in measurement_cols:
                    measurement = Measurement(
                        sample_id=sample.id,
                        variable_id=variable_cache[name],
                        value=float(row[name]),
                    )
                    session.add(measurement)

                print(
                    f"Loaded sample {sample.pscid} with {len(measurement_cols)} measurements."
                )
            session.commit()


def load_stats_file(file_path: Path):
    """
    Load statistics from CSV file.

    Args:
        file_path (Path): Path to the CSV file.

    Note that the "type" of the stats is encoded in the filename, e.g.,
    "stats_metabolites_CCA.csv" (for metabolite CCA stats).
    """

    stats_type = file_path.stem.split("_")[
        1
    ]  # "metabolites", "miRNA", "proteins"
    stats_condition = file_path.stem.split("_")[
        2
    ]  # "CCA", "IBD", "alp", "bilirubin", "fibrosis"

    with file_path.open("r") as f:
        reader = csv.DictReader(f)

        with get_session() as session:
            variable_cache = {}

            for row in reader:
                variable_name = row["Variable"]
                variable = (
                    session.query(Variable)
                    .filter_by(name=variable_name)
                    .first()
                )
                if not variable:
                    variable = Variable(name=variable_name)
                    session.add(variable)
                    session.flush()  # To get variable.id
                variable_cache[variable_name] = variable.id

                # Create savepoint for IntegrityError handling.
                savepoint = session.begin_nested()

                try:
                    base_stats = BaseStats(
                        variable_id=variable_cache[variable_name],
                        condition=stats_condition,
                        fold_change=float(row["FoldChange"]),
                        log2fc=parse_float(row["log2FC"]),
                        p_value=parse_float(row["p_value"]),
                        auc=float(row["AUC"]),
                        adj_p_value=parse_float(row["adj_p_value"]),
                    )

                    match stats_condition:
                        case "CCA":
                            median_group1 = float(row["median_noCCA"])
                            median_group2 = float(row["median_CCA"])
                        case "IBD":
                            median_group1 = float(row["median_noIBD"])
                            median_group2 = float(row["median_IBD"])
                        case "alp":
                            median_group1 = float(row["median_low_ALP"])
                            median_group2 = float(row["median_high_ALP"])
                        case "bilirubin":
                            median_group1 = float(row["median_low_bilirubin"])
                            median_group2 = float(
                                row["median_high_bilirubin"]
                            )
                        case "fibrosis":
                            median_group1 = float(row["median_low_fibrosis"])
                            median_group2 = float(row["median_high_fibrosis"])
                        case _:
                            raise ValueError(
                                f"Unknown stats condition: {stats_condition}"
                            )

                    base_stats.median_group1 = median_group1
                    base_stats.median_group2 = median_group2

                    session.add(base_stats)
                    session.flush()  # To get base_stats.id

                    stats: MetaboliteStats | MiRNAStats | ProteinStats

                    match stats_type:
                        case "metabolites":
                            stats = MetaboliteStats(
                                id=base_stats.id,
                                biochemical=row["BIOCHEMICAL"],
                                pubchem=parse_string(row["PUBCHEM"]),
                                hmdb=parse_string(row["HMDB"]),
                                super_pathway=row["SUPER PATHWAY"],
                                sub_pathway=row["SUB PATHWAY"],
                            )
                        case "miRNA":
                            stats = MiRNAStats(id=base_stats.id)
                        case "proteins":
                            stats = ProteinStats(
                                id=base_stats.id,
                                assay=row["Assay"],
                                description=parse_string(row["description"]),
                                uniprot_id=parse_string(row["Uniprot ID"]),
                            )
                        case _:
                            raise ValueError(
                                f"Unknown stats type: {stats_type}"
                            )

                    session.add(stats)
                    session.flush()

                    savepoint.commit()

                    print(
                        f"Added {stats_type} {stats_condition} stats for variable {variable_name}."
                    )

                except IntegrityError:
                    # Rollback to savepoint on error (e.g., duplicate
                    # (variable_id, condition)).
                    savepoint.rollback()
                    print(
                        f"*** Skipping duplicate stats entry for variable {variable_name} and condition {stats_condition}."
                    )

            session.commit()


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python load-data.py <path_to_csv_file>")
        sys.exit(1)

    csv_file_path = Path(sys.argv[1])
    if not csv_file_path.exists():
        print(f"File not found: {csv_file_path}")
        sys.exit(1)

    # If the filename starts with "data_", load the data using
    # load_data_file.  If the filename starts with "stats_", load the
    # data using load_stats_file.

    match csv_file_path.stem.split("_")[0]:
        case "data":
            load_data_file(csv_file_path)
        case "stats":
            load_stats_file(csv_file_path)
        case _:
            print(
                "Invalid file type. Filename must start with 'data_' or 'stats_'."
            )
            sys.exit(1)
