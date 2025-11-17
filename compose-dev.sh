#!/bin/sh -

here=$(dirname "$0")

# In development mode, we create the "vol" directory if it does not
# exist and ensure that it is writable.
if ! ( mkdir -p "$here/vol" && touch "$here/vol/.keep" )
then
	printf 'Cannot create or write to directory %s/vol\n' "$here" >&2
	exit 1
fi

exec "$here/compose-prod.sh" \
	-f docker-compose.dev.yml \
	"$@"
