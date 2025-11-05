import csv
from datetime import datetime
from pathlib import Path
from psc_atlas.models import Sample, Measurement, YesNo, HiLo
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
            return datetime.strptime(value, "%Y%m%d").date()


def parse_string(value) -> str | None:
    """Convert string to str, or None for NA."""
    value = value.strip()
    match value.lower():
        case "na":
            return None
        case _:
            return value


def load_samples(file_path: Path):
    """
    Load data from CSV file.

    Args:
        file_path (Path): Path to the CSV file.

    Note that the "type" of the data is encoded in the filename, e.g.,
    "data_metabolites_PSC.csv" (for metabolite data).
    """

    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

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

        measurement_cols = set(reader.fieldnames) - sample_cols

        with get_session() as session:
            for row in reader:
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

                for name in measurement_cols:
                    measurement = Measurement(
                        sample_id=sample.id,
                        protein=name,
                        value=float(row[name]),
                    )
                    session.add(measurement)

                print(
                    f"Loaded sample {sample.pscid} with {len(measurement_cols)} measurements."
                )
            session.commit()


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python load-data.py <path_to_csv_file>")
        sys.exit(1)

    csv_file_path = Path(sys.argv[1])
    load_samples(csv_file_path)
