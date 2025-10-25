# PSC Atlas

## Assumed deployment environment

This project assumes that it will be deployed as something similar to a
"Custom App" on [SciLifeLab Serve](https://serve.scilifelab.se/). Its
"production environment" is therefore restricted to using only a single
Docker container, with a single persistent volume, and no bind mounts.

## Development and production environments

The `docker-compose.yml` file defines the production environment, while
the `docker-compose.dev.yml` contains the overrides for the development

Thus, to start the production environment, use:

``` sh
./compose-prod.sh up --build
```

(Skip `--build` if you use pre-built Docker images.)

To start the development environment, use:

``` sh
./compose-dev.sh up --build
```

The two convenience scripts `compose-prod.sh` and `compose-dev.sh` are
used as wrappers for `docker compose` commands addressing the respective
environments.

For example:

``` sh
./compose-prod.sh {up|down|logs|...}
```

### Entrypoints

There are two main entrypoints for the site in the docker setup. The
static fronted and the backend API which can be found as follows:

- Backend API: http://localhost:3320/api/v1/
- Frontend: http://localhost:3320/

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

## Docker build targets

- `node:24-alpine`
  - `frontend`
    - `frontend-dev` (`./frontend` context)
    - `frontend-prod` (`./` context)
    - `frontend-update-lock (`./frontend` context)
- `python:3.12-alpine`
  - `backend`
    - `backend-dev` (`./backend` context)
    - `backend-prod` (`./` context)
    - `backend-update-lock` (`./backend` context)
- `alpine:3.22`
  - `proxy` (`./` context)
    - `proxy-dev`
    - `proxy-frontend`
      - copy from `frontend-prod`
    - `proxy-backend`
      - copy from `backend-prod`
    - `proxy-prod`
      - copy from `proxy-frontend` and `proxy-backend`
