#!/bin/sh -

set -u

# Set up the various directories that we expect to be present in
# "$HOME/vol", if they do not already exist.

if ! chmod u+rwx "$HOME/vol"
then
	printf 'Cannot set permissions on volume mount "%s"; exiting.\n' \
		"$HOME/vol" >&2
	exit 1
fi

if [ "$SERVICE_MODE" = development ]
then
	uv sync --frozen
fi

# Migrate database if needed.
mkdir -p "$HOME/vol/database" || exit
uv run alembic upgrade head || exit

# Start the ingester script in the background.
./ingester.sh &

if [ "$SERVICE_MODE" = development ]
then
	exec uv run uvicorn "psc_atlas:create_app" \
		--reload \
		--host 0.0.0.0 \
		--port 8000
else
	exec gunicorn "psc_atlas:create_app()" \
		--forwarded-allow-ips='*' \
		--timeout "${PSC_API_TIMEOUT:-30}" \
		-b 0.0.0.0:8000 \
		-w "${PSC_API_WORKERS:-4}" \
		-k uvicorn.workers.UvicornWorker
fi
