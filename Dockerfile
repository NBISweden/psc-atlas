FROM alpine:3.22 AS base

# Common dependencies and setup.

ARG UID=1000
ARG GID=1000

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
    apk --cache-dir=/var/cache/apk add \
	python3~3

RUN adduser -D -u "$UID" -g "$GID" psc-atlas

WORKDIR /home/psc-atlas

# Create mountpoint for the persistent volume.
RUN install -d -o "$UID" vol

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
