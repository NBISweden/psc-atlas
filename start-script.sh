#!/bin/sh -

set -u

if [ "$SERVICE_MODE" = production ]; then
	backend/start-script.sh &

	# Note: No start-script.sh for the frontend in production mode
	# because Caddy serves the static files directly.
fi

# Note: In development mode, the backend and frontend
# run in separate containers.

exec caddy run --config ./Caddyfile
