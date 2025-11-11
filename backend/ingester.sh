#!/bin/sh -

set -u

# This script watches for new files in "$WATCH_DIR".  "New files"
# are defined as files that are either created in or moved into that
# directory.
#
# When a new file is detected, the script waits until the contents of
# the directory stabilize (i.e., no further changes are detected for a
# short period of time).  It then looks for any Zip archives, extracts
# their contents into "$EXTRACT_DIR" and loads any CSV files found using
# the "load-data.py" script.
#
# Processed archives are moved to "$PROCESSED_DIR".  CSV files that fail
# to load are moved to "$FAILED_DIR" for possible further inspection,
# while successfully loaded CSV files are deleted after processing.

WATCH_DIR="$HOME/vol/uploads"
EXTRACT_DIR="$HOME/vol/tmp"
PROCESSED_DIR="$HOME/vol/processed"
FAILED_DIR="$HOME/vol/failed"

# FAILED_DIR is exported to be visible to the inlined shell script
# executed by 'find ... -exec sh -c ...'.
export FAILED_DIR

# Ensure required directories exist.
mkdir -p "$WATCH_DIR" "$EXTRACT_DIR" "$PROCESSED_DIR" "$FAILED_DIR"

dirchecksum () {
	find "$1" -type f -exec md5sum {} + | sort | md5sum
}

inotifywait -m -e close_write,moved_to --format '%f' "$WATCH_DIR" |
while read filename
do
	# Wait until the content of the directory stabilizes.
	while true; do
		checksum_before=$(dirchecksum "$WATCH_DIR")
		sleep 5
		checksum_after=$(dirchecksum "$WATCH_DIR")

		if [ "$checksum_before" = "$checksum_after" ]; then
			break
		fi
	done

	# We ignore the filename in $filename and instead loop over all
	# names that look like names of Zip archives.
	for archive in "$WATCH_DIR"/*.zip; do
		printf "Processing archive: %s\n" "$archive" >&2
		if ! unzip -o "$archive" -d "$EXTRACT_DIR"
		then
			printf "Failed to extract archive: %s\n" "$archive" >&2
			mv -f "$archive" "$FAILED_DIR/"
			continue
		fi

                # Now look for CSV file and process them.  We ignore
                # names that are hidden files (starting with a dot).
		find "$EXTRACT_DIR" \
			! -name '.*' \
			-name '*.csv' \
			-type f \
			-exec sh -c '
				printf "Loading CSV file: %s\n" "$1" >&2
				if ! uv run load-data "$1"
				then
					printf "Failed to load CSV file: %s\n" "$1"
					mv -f "$1" "$FAILED_DIR/"
				else
					rm -f "$1"
				fi >&2' sh {} \;

		# Clean up extracted files and move processed archive.
		find "$EXTRACT_DIR" ! -path "$EXTRACT_DIR" -delete
		mv -f "$archive" "$PROCESSED_DIR/"
		printf "Finished processing archive: %s\n" "$archive" >&2
	done
done
