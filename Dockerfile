FROM alpine:3.22 AS base

# Common dependencies and setup.

ARG UID=1000
ARG GID=1000

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
    apk --cache-dir=/var/cache/apk add \
    python3~3 uv

RUN adduser -D -u "$UID" -g "$GID" psc-atlas

WORKDIR /home/psc-atlas

# Create mountpoint for the persistent volume.
RUN install -d -o "$UID" vol

#-----------------------------------------------------------------------

FROM base AS dev

WORKDIR /home/psc-atlas/backend

CMD ["./start-script.dev.sh"]

#-----------------------------------------------------------------------
FROM base AS backend-build

# Production-specific setup.

RUN mkdir -p /home/psc-atlas/backend
COPY --exclude=.venv --exclude=__pycache__ --exclude=start-script*.sh --chown=$UID backend backend
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

CMD ["./start-script.sh"]
