from psc_atlas.routers import core
from fastapi import FastAPI


def create_app():
    app = FastAPI()
    app.include_router(
        core.router,
        prefix="/v1",
    )
    return app
