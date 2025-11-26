from psc_atlas.routers import core
from psc_atlas.routers import sample
from fastapi import FastAPI
import os


DEFAULT_ROOT_PATH = os.environ.get("PSC_ATLAS_DEFAULT_ROOT_PATH", "/api")


def create_app(root_path=DEFAULT_ROOT_PATH):
    app = FastAPI(root_path=root_path)
    app.include_router(
        core.router,
        prefix="/v1",
    )
    app.include_router(
        sample.router,
        prefix="/v1/sample",
    )
    return app
