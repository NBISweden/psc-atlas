from psc_atlas.routers import core
from fastapi import FastAPI
import os


DEFAULT_ROOT_PATH=os.environ.get("PSC_ATLAS_DEFAULT_ROOT_PATH", "")


def create_app(root_path=DEFAULT_ROOT_PATH):
    app = FastAPI(root_path=root_path)
    app.include_router(
        core.router,
        prefix="/v1",
    )
    return app
