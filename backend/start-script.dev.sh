#!/bin/sh -

uv sync && \
uv run uvicorn "psc_atlas:create_app" \
    --reload \
    --host 0.0.0.0
