# File and content format for uploaded files

This document describes the format that should be used for files
uploaded to this service. The format is designed to be easy to
programmatically parse, while at the same time being as general as
possible to accommodate a wide variety of use cases.

## File format

The format of uploaded files should be either individual CSV text files
or Zip archives containing multiple CSV text files.

If the uploaded file is a Zip archive, it may contain multiple CSV
files, each representing a different dataset. Each CSV file within the
archive should follow the same format as described below for individual
CSV files.

The directory structure within the Zip archive is not significant, and
all CSV files will be processed regardless of their location within the
archive. However, files and directories that have hidden names (starting
with a dot) will be ignored.

## File naming conventions

Each uploaded file (whether a standalone CSV file or a CSV file within a
Zip archive) should have a name starting with `data_{type}`, where
`{type}` is a string that indicates the type of data contained in the
file (e.g., `metabolites`, `miRNA`, `proteins`, etc.)

If the filename contains additional descriptive information, it should
be separated from the main components by an underscore (this information
is currently discarded). The filename ends with the filename suffix
`.csv`.

For example:

- `data_metabolites_PSC.csv`
- `data_miRNA_PSC.csv`

## File content format (CSV files)

Each CSV file should use commas as field delimiters, double quotes for
any quoted fields, and backslashes for escaping special characters, if
needed.

The first record (line) of the CSV file must be the header, which
defines the names of the fields. Each subsequent record represents a
data record. No header field may be empty, and each data record must
have the same number of fields as the header.

The relative order of fields in the CSV file is not significant, as long
as the required fields are present and other fields follow the naming
conventions described below.

### Required fields

Each CSV file must contain the following required fields:

- `sample_id`: A unique identifier for each data record. This field must
  contain non-empty values that uniquely identify each record within the
  file.

- `sample_date`: The date when the sample was collected. The date must
  be in the ISO 8601 format `YYYY-MM-DD` (e.g., `2023-08-15`). The value
  may be empty if it's not known.

### Dynamic data fields

There are two types of dynamic data fields that may be included in the
CSV files: *categorical metadata fields* and *measurement fields*.

Categorical metadata fields are used to provide additional category
information about each data record. Metadata field names must start with
the prefix `meta_`. The values of metadata fields are used for
(typically, but not necessarily, binary-state) conditions, such as
`HIGH` or `LOW`, `YES` or `NO`, or `TRUE` or `FALSE`.

The names of metadata fields should be chosen to be descriptive of the
condition they represent. The names, with the `meta_` prefix removed,
will be displayed in the user interface, so they should be concise yet
informative. For example, a metadata field representing whether a sample
was taken from a patient with a certain condition might be named
`meta_condition`, where `condition` is a short descriptive term.
Similarly, values of metadata fields should also be chosen to be
descriptive and user-friendly. Strings like `1` and `0` should be
avoided in favor of more descriptive terms like `YES` and `NO`.

It is expected that there will be relatively few metadata fields in each
file (typically less than 10), and that these fields will often contain
categorical data.

Measurement fields are used to provide quantitative data for each data
record. Measurement field names are arbitrary strings (names of
variables) that do not start with the `meta_` prefix or coincide with
the names of the required fields (`sample_id` and `sample_date`).
Measurement fields must only contain numeric values (integers or
floating-point numbers).

It is expected that there will be many measurement fields in each file
(typically hundreds or thousands).

### Example CSV files

Patient samples with condition metadata. The healthy controls have `NA`
values for the `meta_condition` metadata field. Note that the
application makes no special distinction between healthy controls and
patient samples; this is just an example of how to represent such data.
``` csv
sample_id,sample_date,meta_condition,measurement_1,measurement_2,measurement_3
PSC001,2023-08-15,HIGH,12.5,7.8,3.4
PSC002,2023-08-16,LOW,9.2,6.1,4.5
HEALTHY01,,NA,15.3,8.4,2.9
HEALTHY02,,NA,14.7,9.0,3.1
```

Encoding healthy controls as a `YES`/`NO` metadata field. Here, healthy
controls have `YES` for the `meta_healthy` field, while patient samples
have `NO`. Additional metadata fields represent different conditions.
Again, the application makes no special distinction between healthy
controls and patient samples; this is just an example of how to
represent such data.

``` csv
sample_id,sample_date,meta_healthy,meta_alp,meta_bilirubin,metabolite_A,metabolite_B,metabolite_C
1,2023-08-15,NO,LOW,HIGH,0.56,1.23,2.34
2,2023-08-16,NO,HIGH,LOW,3.45,4.56,5.67
3,,YES,,,6.78,7.89,8.90
4,,YES,,,9.01,0.12,1.23
```

