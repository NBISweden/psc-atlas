# PSC Atlas

## Assumed deployment environment

This project assumes that it will be deployed as something similar to a
"Custom App" on [SciLifeLab Serve](https://serve.scilifelab.se/). It's
"production environment" is therefore restricted to using only a single
Docker container, with a single persistent volume, and no bind mounts.

## Development and production environments

The `docker-compose.yml` file defines the production environment, while
the `docker-compose.dev.yml` contains the overrides for the development
environment.

Thus, to start the production environment, use:

``` sh
docker compose up
```

To start the development environment, use:

``` sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

There is also a convenience script, `docker-compose.sh`, that can be
used as a wrapper for `docker compose` commands addressing the
development environment:

``` sh
./docker-compose.sh {up|down|...}
```

### Differences between development and production environments

The main differences between the two environments are:

- There are currently no effective differences between the two
  environments, but the `docker-compose.yml` Compose file uses the
  `prod` target of the `Dockerfile`, while the `docker-compose.dev.yml`
  Compose file uses the `dev` target of the `Dockerfile`. These two
  targets are currently identical (and do nothing).

The production environment should ideally be pulling a ready-made image
from a registry and only be building the image locally for testing
purposes. This is not yet implemented as there is currently no built
image available in a registry.
