from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .config import ALLOWED_ORIGINS
from .database import init_db
from .logging_setup import setup_logging
from .security import limiter, SecurityHeadersMiddleware
from .routes.evaluate import router as evaluate_router
from .routes.analytics import router as analytics_router
from .routes.deals import router as deals_router
from .routes.ask import router as ask_router
from .routes.automation import router as automation_router

setup_logging()

app = FastAPI(title="Meridian — Fund Manager Intelligence")

# Rate limiter (per remote address; header-aware via --proxy-headers uvicorn flag)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Rate limit exceeded. Please slow down.",
            "limit": str(exc.detail) if hasattr(exc, "detail") else "rate limited",
        },
        headers={"Retry-After": "60"},
    )


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_origin_regex=r"^https://.*\.pages\.dev$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*", "X-API-Key"],
)

# Security headers on every response
app.add_middleware(SecurityHeadersMiddleware)


@app.on_event("startup")
def _startup():
    init_db()


@app.get("/health")
def health():
    return {"ok": True}


app.include_router(evaluate_router)
app.include_router(analytics_router)
app.include_router(deals_router)
app.include_router(ask_router)
app.include_router(automation_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
