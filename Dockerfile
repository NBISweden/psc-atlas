FROM alpine:latest AS base

# Common dependencies and setup.

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
    apk --cache-dir=/var/cache/apk add \
        sqlite

ARG UID=1000
RUN adduser -D -u "$UID" psc-atlas

WORKDIR /home/psc-atlas

# Create mountpoint for the persistent volume.
RUN install -d -o psc-atlas -m 700 vol

USER "$UID"

#-----------------------------------------------------------------------

FROM base AS prod

# Production-specific setup.

#-----------------------------------------------------------------------

FROM base AS dev

# Development-specific setup.
