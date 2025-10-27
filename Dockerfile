FROM node:24-alpine AS frontend

ARG UID=1000
ARG GID=1000

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
	apk --cache-dir=/var/cache/apk add \
		dumb-init

ENV HOME=/home/psc-atlas

ENV npm_config_cache="$HOME/.cache/npm" \
    npm_config_loglevel=info

ENV NEXT_TELEMETRY_DISABLED=1

RUN install -d -o "$UID" -g "$GID" "$HOME" "$HOME/frontend"

USER "$UID:$GID"

WORKDIR "$HOME/frontend"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./start-script.sh"]

# ----

FROM frontend AS frontend-build

ENV SERVICE_MODE=production

ENV NODE_ENV=production

COPY --chown="$UID:$GID" frontend/package*.json .

RUN --mount=type=cache,id=npm-cache,uid="$UID",target="$npm_config_cache" \
	npm ci --omit=dev

COPY --chown="$UID:$GID" frontend/tsconfig.json .
COPY --chown="$UID:$GID" frontend/next.config.ts .
COPY --chown="$UID:$GID" frontend/eslint.config.mjs .

COPY --chown="$UID:$GID" frontend/src src
COPY --chown="$UID:$GID" frontend/public public

RUN mkdir .next
RUN --mount=type=cache,id=npm-cache,uid="$UID",target="$npm_config_cache" \
    --mount=type=cache,id=next-cache,uid="$UID",target=".next/cache" \
	    npm run build

# Note: The exported static files produced by this build step are copied
# in the "proxy-prod" stage.

# ----

FROM frontend AS frontend-dev

ENV SERVICE_MODE=development

ENV NODE_ENV=development

# ----

FROM frontend-dev AS frontend-update-lock

RUN --mount=type=bind,source=package.json,target=./package.json \
    --mount=type=cache,id=npm-cache,uid="$UID",target="$npm_config_cache" \
	npm install \
		--package-lock-only \
		--ignore-scripts \
		--no-audit \
		--fund=false

CMD ["cat", "package-lock.json"]

# ----

FROM python:3.12-alpine AS backend

ARG UID=1000
ARG GID=1000

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
	apk --cache-dir=/var/cache/apk add \
		dumb-init

ENV HOME=/home/psc-atlas

ENV UV_CACHE_DIR="$HOME/.cache/uv"
ENV MYPY_CACHE_DIR="$HOME/.cache/mypy"
ENV PIP_CACHE_DIR="$HOME/.cache/pip"

RUN install -d -o "$UID" -g "$GID" "$HOME" "$HOME/backend"

USER "$UID:$GID"

WORKDIR "$HOME/backend"

RUN --mount=type=cache,id=pip-cache,uid="$UID",target="$PIP_CACHE_DIR" \
	python -m pip install \
		uv

ENV PATH="$HOME/.local/bin:$PATH"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./start-script.sh"]

# ----

FROM backend AS backend-build

ENV SERVICE_MODE=production

COPY --chown="$UID:$GID" backend .

RUN --mount=type=cache,id=uv-cache,uid="$UID",target="$UV_CACHE_DIR" \
	uv sync --frozen

RUN --mount=type=cache,id=uv-cache,uid="$UID",target="$UV_CACHE_DIR" \
    --mount=type=cache,id=mypy-cache,uid="$UID",target="$MYPY_CACHE_DIR" \
	uv run mypy .

RUN --mount=type=cache,id=uv-cache,uid="$UID",target="$UV_CACHE_DIR" \
	uv run python -m build

# Note: The built wheel file is copied in the "proxy-prod" stage.

# ----

FROM backend AS backend-dev

ENV SERVICE_MODE=development

ENV PYTHONDONTWRITEBYTECODE=1

# ----

FROM backend-dev AS backend-update-lock

RUN --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    --mount=type=cache,id=uv-cache,uid="$UID",target="$UV_CACHE_DIR" \
	uv lock --upgrade

CMD ["cat", "uv.lock"]

# ----

FROM alpine:3.22 AS proxy

ARG UID=1000
ARG GID=1000

ENV HOME=/home/psc-atlas

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
	apk --cache-dir=/var/cache/apk add \
		caddy \
		dumb-init \
		uv

RUN install -d -o "$UID" -g "$GID" "$HOME"

USER "$UID:$GID"

RUN uv python install

WORKDIR "$HOME"

COPY --chown="$UID:$GID" caddy/Caddyfile .
COPY --chown="$UID:$GID" start-script.sh .

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./start-script.sh"]

# ----

FROM proxy AS proxy-prod

ENV SERVICE_MODE=production

# Copy frontend static files.

WORKDIR "$HOME/frontend"

COPY --from=frontend-build --chown="$UID:$GID" \
	"$HOME"/frontend/out .

# Copy backend start script and wheel file, and install backend
# in virtual environment.

ENV UV_CACHE_DIR="$HOME/.cache/uv"
ENV MYPY_CACHE_DIR="$HOME/.cache/mypy"
ENV PIP_CACHE_DIR="$HOME/.cache/pip"

ENV PATH="$HOME/backend/.venv/bin:$PATH"

WORKDIR "$HOME/backend"

COPY --chown="$UID:$GID" \
	backend/start-script.sh .

COPY --from=backend-build --chown="$UID:$GID" \
	"$HOME"/backend/dist/psc_atlas-*.whl  \
	/tmp

RUN --mount=type=cache,id=uv-cache,uid="$UID",target="$UV_CACHE_DIR" \
	uv venv .venv

RUN --mount=type=cache,id=uv-cache,uid="$UID",target="$UV_CACHE_DIR" \
	uv pip install /tmp/psc_atlas-*.whl

RUN rm /tmp/psc_atlas-*.whl

ENV PATH="$HOME/backend/.venv/bin:$PATH"

# ----

FROM proxy AS proxy-dev

ENV SERVICE_MODE=development

WORKDIR "$HOME"
