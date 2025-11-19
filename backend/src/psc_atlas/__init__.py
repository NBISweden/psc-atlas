from psc_atlas.routers import core
from psc_atlas.routers import sample
from psc_atlas.routers import variable
from psc_atlas.routers import measurement
from fastapi import FastAPI
import os


DEFAULT_ROOT_PATH = os.environ.get("PSC_ATLAS_DEFAULT_ROOT_PATH", "")


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
    app.include_router(
        variable.router,
        prefix="/v1/variable",
    )
    app.include_router(
        measurement.router,
        prefix="/v1/measurement",
    )
    return app
