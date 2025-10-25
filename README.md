# PSC Atlas

## Assumed deployment environment

This project assumes that it will be deployed as something similar to a
"Custom App" on [SciLifeLab Serve](https://serve.scilifelab.se/). Its
"production environment" is therefore restricted to using only a single
Docker container, with a single persistent volume, and no bind mounts.

### Exposed endpoints

There are two exposed endpoints for the site, the frontend and the
backend API, which can be found as follows:

- Backend API: http://localhost:3320/api/v1/
- Frontend: http://localhost:3320/

## Development and production environments

The `docker-compose.yml` file defines the production environment, while
the `docker-compose.dev.yml` contains the overrides for the development
environment.

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

### Differences between development and production environments

The main differences between the two environments are:

- In the development environment, the frontend and backend code is
  mounted as bind mounts, allowing for live code changes without
  rebuilding the Docker images. In production, the code is copied into
  the images at build time.

- In the development environment, the project runs in three distinct
  containers: one for the frontend, one for the backend, and one for the
  reverse proxy. The reverse proxy is the only container exposed to the
  outside world.

  In production, what is logically the proxy, serves the frontend as
  static files and proxies API requests to the backend, all within a
  single container.

The production environment should ideally be pulling a ready-made image
from a registry and only be building the image locally for testing
purposes. This is not yet implemented as there is currently no built
image available in a registry.

## Docker build structure

- `node:24-alpine`
  - `frontend`
    - `frontend-dev` (`./frontend` context)
    - `frontend-prod` (`./` context)
    - `frontend-update-lock` (`./frontend` context)
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
