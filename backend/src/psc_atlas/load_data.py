#!/usr/bin/env python3

import csv
import time

from datetime import datetime
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from psc_atlas.models import Sample
from psc_atlas.models import ConditionVariable, Condition
from psc_atlas.models import MeasurementVariable, Measurement

from psc_atlas.models import (
    BaseStats,
    MetaboliteStats,
    MiRNAStats,
    ProteinStats,
)

from psc_atlas.session import get_session

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def parse_date(value) -> datetime | None:
    """Convert YYYYMMDD string to datetime object, or None."""
    value = value.strip()
    try:
        return datetime.strptime(value, "%Y%m%d")
    except ValueError:
        logger.warning(f"Invalid date format: {value}")
        return None


def load_data_file(file_path: Path):
    """
    Load data from CSV file.

    Args:
        file_path (Path): Path to the CSV file.

    Note that the "type" of the data is encoded in the filename, e.g.,
    "data_metabolites_PSC.csv" (for metabolite data).
    """

    data_type = file_path.stem.split("_")[1]  # Extract type from filename

    logger.info(f"Loading {data_type} data from file: {file_path}")

    with file_path.open("r") as f:
        reader = csv.DictReader(f)

        # For the current version of the data, column 1 is ignored,
        # column 2 is the sample ID, column 3 is the sample date, column
        # 4 is "PSCID" (ignored), columns 5-9 are condition metadata
        # (PSC, CCA, IBD, Fibrosis, Bilirubin, ALP), and columns 10 and
        # beyond are the actual measurement

        with get_session() as session:
            condition_variable_cache = {}
            measurement_variable_cache = {}

            fieldnames = reader.fieldnames or []

            for name in fieldnames[4:10]:
                condition_variable = (
                    session.query(ConditionVariable).filter_by(name=name)
                ).first()
                if not condition_variable:
                    condition_variable = ConditionVariable(name=name)
                    session.add(condition_variable)
                    session.flush()  # To get condition_variable.id

                condition_variable_cache[name] = condition_variable.id

            for name in fieldnames[10:]:
                measurment_variable = (
                    session.query(MeasurementVariable).filter_by(name=name)
                ).first()
                if not measurment_variable:
                    measurment_variable = MeasurementVariable(name=name)
                    session.add(measurment_variable)
                    session.flush()  # To get measurment_variable.id

                measurement_variable_cache[name] = measurment_variable.id

            progress_time = time.time()

            for row in reader:
                # Create savepoint for IntegrityError handling.
                savepoint = session.begin_nested()

                try:
                    sample = Sample(
                        type=data_type,
                        sample_id=row[fieldnames[1]],
                        sample_date=parse_date(row[fieldnames[2]]),
                    )
                    session.add(sample)
                    session.flush()  # To get sample.id

                    for name in condition_variable_cache:
                        condition = Condition(
                            sample_id=sample.id,
                            condition_variable_id=condition_variable_cache[name],
                            value=row[name],
                        )
                        session.add(condition)

                    for name in measurement_variable_cache:
                        measurement = Measurement(
                            sample_id=sample.id,
                            measurement_variable_id=measurement_variable_cache[name],
                            value=float(row[name]),
                        )
                        session.add(measurement)

                    savepoint.commit()

                except IntegrityError:
                    # Rollback to savepoint on error
                    savepoint.rollback()
                    logger.warning(
                        f"Skipping duplicate sample entry for sample ID {row[fieldnames[1]]}."
                    )
                    continue

                # Print progress every 5 seconds.
                current_time = time.time()
                if current_time - progress_time >= 5.0:
                    progress_time = current_time
                    logger.info(
                        f"Processed {reader.line_num} rows for data type {data_type}."
                    )

            logger.info(f"Finished processing data file. Total rows: {reader.line_num}")


def load_stats_file(file_path: Path):
    """
    Load statistics from CSV file.

    Args:
        file_path (Path): Path to the CSV file.

    Note that the "type" of the stats is encoded in the filename, e.g.,
    "stats_metabolites_CCA.csv" (for metabolite CCA stats).
    """

    stats_type = file_path.stem.split("_")[1]  # "metabolites", "miRNA", "proteins"
    stats_condition = file_path.stem.split("_")[
        2
    ]  # "CCA", "IBD", "alp", "bilirubin", "fibrosis"

    logger.info(
        f"Loading {stats_type} stats for condition {stats_condition} from file: {file_path}"
    )

    with file_path.open("r") as f:
        reader = csv.DictReader(f)

        with get_session() as session:
            variable_cache = {}

            progress_time = time.time()

            for row in reader:
                variable_name = row["Variable"]
                variable = (
                    session.query(MeasurementVariable)
                    .filter_by(name=variable_name)
                    .first()
                )
                if not variable:
                    variable = MeasurementVariable(name=variable_name)
                    session.add(variable)
                    session.flush()  # To get variable.id

                variable_cache[variable_name] = variable.id

                # Create savepoint for IntegrityError handling.
                savepoint = session.begin_nested()

                try:
                    base_stats = BaseStats(
                        variable_id=variable_cache[variable_name],
                        condition=stats_condition,
                        fold_change=row["FoldChange"],
                        log2fc=row["log2FC"],
                        p_value=row["p_value"],
                        auc=row["AUC"],
                        adj_p_value=row["adj_p_value"],
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
                            median_group2 = float(row["median_high_bilirubin"])

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
                                pubchem=row["PUBCHEM"],
                                hmdb=row["HMDB"],
                                super_pathway=row["SUPER PATHWAY"],
                                sub_pathway=row["SUB PATHWAY"],
                            )
                        case "miRNA":
                            stats = MiRNAStats(id=base_stats.id)
                        case "proteins":
                            stats = ProteinStats(
                                id=base_stats.id,
                                assay=row["Assay"],
                                description=row["description"],
                                uniprot_id=row["Uniprot ID"],
                            )
                        case _:
                            raise ValueError(f"Unknown stats type: {stats_type}")

                    session.add(stats)
                    session.flush()

                    savepoint.commit()

                    # Print progress every 5 seconds.
                    current_time = time.time()
                    if current_time - progress_time >= 5.0:
                        progress_time = current_time
                        logger.info(
                            f"Processed {reader.line_num} rows for stats type {stats_type} and condition {stats_condition}."
                        )

                except IntegrityError:
                    # Rollback to savepoint on error (e.g., duplicate
                    # (variable_id, condition)).
                    savepoint.rollback()
                    logger.warning(
                        f"Skipping duplicate stats entry for variable {variable_name} and condition {stats_condition}."
                    )

            logger.info(
                f"Finished processing stats file. Total rows: {reader.line_num}"
            )


def main():
    import sys

    # Loop over the command-line arguments and process each as a CSV
    # file.

    if len(sys.argv) < 2:
        print("Usage: python load_data.py <csv_file_path> ...")
        sys.exit(1)

    for csv_file in sys.argv[1:]:
        csv_file_path = Path(csv_file)

        if not csv_file_path.exists():
            logger.warning(f"File not found (skipping): {csv_file_path}")
            continue

        # If the filename starts with "data_", load the data using
        # load_data_file.  If the filename starts with "stats_", load
        # the data using load_stats_file.

        match csv_file_path.stem.split("_")[0]:
            case "data":
                load_data_file(csv_file_path)
            case "stats":
                load_stats_file(csv_file_path)
            case _:
                logger.warning(f"Unrecognized file type (skipping): {csv_file_path}")
                continue


if __name__ == "__main__":
    main()
