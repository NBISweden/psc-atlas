#!/bin/sh -

caddy start --config /home/psc-atlas/Caddyfile
uv sync && \
uv run uvicorn "psc_atlas:create_app" \
    --reload \
    --host 0.0.0.0 \
    --port 8000
