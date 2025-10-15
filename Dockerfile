FROM alpine:3.22 AS base

# Common dependencies and setup.

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
    apk --cache-dir=/var/cache/apk add \
	caddy~2.10 \
	sqlite~3

ARG UID=1000
RUN adduser -D -u "$UID" psc-atlas

WORKDIR /home/psc-atlas

# Create mountpoint for the persistent volume.
RUN install -d -o "$UID" -m 700 vol

USER "$UID"

#-----------------------------------------------------------------------

FROM base AS dev

# Development-specific setup.

# Remove this later, when this build target does something:
RUN echo 'DEVELOPMENT BUILD'

#-----------------------------------------------------------------------

FROM base AS prod

# Production-specific setup.

# Remove this later, when this build target does something:
RUN echo 'PRODUCTION BUILD'
