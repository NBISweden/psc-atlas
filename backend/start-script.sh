#!/bin/sh -

caddy start --config /home/psc-atlas/Caddyfile
uv run gunicorn "psc_atlas:create_app()" \
    --forwarded-allow-ips="*" \
    --timeout "${PSC_API_TIMEOUT:-30}" \
    -b 0.0.0.0:8000 \
    -w "${PSC_API_WORKERS:-4}" \
    -k uvicorn.workers.UvicornWorker
