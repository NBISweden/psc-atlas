FROM alpine:3.22 AS base

# Common dependencies and setup.

ARG UID=1000
ARG GID=1000
ARG API_ROOT="/api"

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
    apk --cache-dir=/var/cache/apk add \
    python3~3 \
    uv \
    caddy~2

RUN adduser -D -u "$UID" -g "$GID" psc-atlas

WORKDIR /home/psc-atlas

# Create mountpoint for the persistent volume.
RUN install -d -o "$UID" vol

ENV PSC_ATLAS_DEFAULT_ROOT_PATH="$API_ROOT"
ENV CADDY_API_ROOT="$API_ROOT"

#-----------------------------------------------------------------------

FROM base AS dev

COPY --chown=$UID --chmod=444 caddy/Caddyfile ./Caddyfile

ENV SERVICE_MODE="development"
ENV PYTHONDONTWRITEBYTECODE=1
WORKDIR /home/psc-atlas/backend

CMD ["./start-script.dev.sh"]

#-----------------------------------------------------------------------
FROM node:24-alpine AS frontend-build

WORKDIR /home/psc-atlas/frontend
COPY frontend/src src
COPY frontend/public public
COPY frontend/package-lock.json package-lock.json
COPY frontend/package.json package.json
COPY frontend/tsconfig.json tsconfig.json
COPY frontend/next.config.ts next.config.ts
COPY frontend/eslint.config.mjs eslint.config.mjs

RUN npm ci
RUN npm run build

#-----------------------------------------------------------------------
FROM base AS backend-build

# Production-specific setup.

RUN mkdir -p /home/psc-atlas/backend
COPY --chown=$UID backend backend
WORKDIR /home/psc-atlas/backend
RUN uv sync
RUN uv run mypy .
RUN uv run python -m build

#-----------------------------------------------------------------------
FROM base AS prod

COPY --chown=$UID --from=backend-build /home/psc-atlas/backend/dist/psc_atlas-*-py3-none-any.whl /tmp/
COPY --chown=$UID backend/start-script.sh start-script.sh
RUN uv venv .venv
RUN uv pip install /tmp/psc_atlas-*-py3-none-any.whl

COPY --chown=$UID --from=frontend-build /home/psc-atlas/frontend/out frontend
COPY --chown=$UID --chmod=444 caddy/Caddyfile ./Caddyfile

ENV SERVICE_MODE="production"

CMD ["./start-script.sh"]
