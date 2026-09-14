"""Basic security primitives: rate limiting, security headers, optional
shared-secret API-key gate.

Everything here is opt-in via env vars so local dev stays frictionless:

- Rate limiting is always on (in-memory; per remote-address).
- Security headers are always applied.
- The X-API-Key gate is active only when API_KEY env var is set. When it is,
  clients calling POST /api/profile must send that same value as an
  `X-API-Key` header. Prevents strangers from burning your LLM budget.
"""
import os
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address

# ---------------------------------------------------------------- Rate limiter
# Uses X-Forwarded-For when behind a proxy (Railway sets it via --proxy-headers)
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

# ------------------------------------------------------------- Security headers
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        h = response.headers
        h.setdefault("X-Content-Type-Options", "nosniff")
        h.setdefault("X-Frame-Options", "DENY")
        h.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        h.setdefault("Permissions-Policy",
                     "geolocation=(), microphone=(), camera=(), payment=()")
        h.setdefault("Strict-Transport-Security",
                     "max-age=63072000; includeSubDomains")
        # No CSP: this API only serves JSON/SSE, and CSP would only affect
        # any accidentally-served HTML. Leaving to the frontend host.
        return response


# ------------------------------------------------------------- API key gate
API_KEY = os.getenv("API_KEY", "").strip()

def require_api_key(request: Request) -> None:
    """FastAPI dependency: enforce X-API-Key on protected routes when
    API_KEY env var is set. When unset (local dev), passes through."""
    if not API_KEY:
        return
    supplied = request.headers.get("X-API-Key", "").strip()
    if supplied != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid X-API-Key header.",
        )
