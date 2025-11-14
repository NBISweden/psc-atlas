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

- In production, persistent data is stored within a volume mounted at
  `/home/psc-atlas/vol`. In development, instead of a volume, a bind
  mount of the `vol` directory at the top of the project's Git
  repository is used (this directory is created automatically if it does
  not exist when starting the development environment).

## Adding dependencies

To add a package within the backend, run

``` sh
uv add {package name}
```

then, inside the `backend` directory, run

``` sh
./update-uv-lock
```

To add a package within the frontend, add it first to the `package.json`
file. Then move to the `frontend` directory and run

``` sh
./update-package-lock
```

## Uploading data into the running container

While the project is up and running, a process is checking for Zip
archives placed in the `vol/uploads` directory. This check is performed
once a minute.

Any found Zip archive is unpacked into `vol/tmp`. After unpacking, the
contents is scanned for CSV files, which are then imported into the
database.

Upon successful import, the uploaded Zip archive is moved to
`vol/processed`. Successfully imported CSV files are removed while CSV
files that could not be imported are moved to `vol/failed`.

When done, all files and directories in `vol/tmp` are removed.

### Uploading files in production

In production, copy the Zip archive into the `uploads` directory within
the persistent volume.

``` sh
./compose-prod.sh up --build -d
./compose-prod.sh cp .../your-archive.zip proxy:/home/psc-atlas/vol/uploads/
./compose-prod.sh logs -f proxy
```

If managing a deployment on SciLifeLab Serve, you may use the "File
Manager" feature to upload the Zip archive into the `uploads` directory
within the project's persistent volume.

When A Zip archive is found in the correct place, the application's log
should say

    Processing archive: /home/psc-atlas/vol/uploads/your-archive.zip

There should then be further log messages about loading CSV files, and
then a final message saying

    Finished processing archive: /home/psc-atlas/vol/uploads/your-archive.zip

indicating that the process is done.

### Uploading files in development

In development, copy the Zip archive into the `vol/uploads` directory at
the top of the project's Git repository. You may then follow the logs of
the backend container (not the proxy container as in production) to see
the progress of the upload and import process.

``` sh
./compose-dev.sh up --build -d
cp .../your-archive.zip vol/uploads/
./compose-dev.sh logs -f backend
```

## Docker build structure

- `node:24-alpine`
  - `frontend`
    - `frontend-build` (`./` context)
    - `frontend-dev` (`./frontend` context)
- `python:3.12-alpine`
  - `backend`
    - `backend-build` (`./` context)
    - `backend-dev` (`./backend` context)
- `alpine:3.22`
  - `proxy` (`./` context)
    - `proxy-prod`
      - copy from `frontend-build` and `backend-build`
    - `proxy-dev`
