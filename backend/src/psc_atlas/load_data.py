#!/usr/bin/env python3

import csv
import time

from datetime import datetime
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from psc_atlas.models import Sample, Measurement, Variable
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
                variable = session.query(Variable).filter_by(name=name).first()
                if not variable:
                    variable = Variable(name=name)
                    session.add(variable)
                    session.flush()  # To get variable.id

                variable_cache[name] = variable.id

            progress_time = time.time()

            for row in reader:
                # Create savepoint for IntegrityError handling.
                savepoint = session.begin_nested()

                try:
                    if row["PSCID"].strip().lower() == "na" or not row["PSCID"].strip():
                        row["PSCID"] = f"NA_row{reader.line_num}"

                    sample = Sample(
                        type=data_type,
                        pscid=row["PSCID"],
                        sampling_date=parse_date(row["sampling_date"]),
                        psc=row["PSC"],
                        cca=row["CCA"],
                        ibd=row["IBD"],
                        fibrosis=row["Fibrosis"],
                        bilirubin=row["Bilirubin"],
                        alp=row["ALP"],
                    )
                    session.add(sample)
                    session.flush()  # To get sample.id

                    savepoint.commit()

                except IntegrityError:
                    # Rollback to savepoint on error (e.g., duplicate
                    # (type, pscid)).
                    savepoint.rollback()
                    logger.warning(
                        f"Skipping duplicate sample entry for PSCID {row['PSCID']} of type {data_type}."
                    )
                    continue

                for name in measurement_cols:
                    measurement = Measurement(
                        sample_id=sample.id,
                        variable_id=variable_cache[name],
                        value=float(row[name]),
                    )
                    session.add(measurement)

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
                variable = session.query(Variable).filter_by(name=variable_name).first()
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
