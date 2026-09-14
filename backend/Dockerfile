# Meridian backend — production image for Railway / any Docker host
FROM python:3.12-slim

# Install system deps needed by some Python packages (curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for runtime
RUN useradd --create-home --shell /bin/bash meridian
WORKDIR /app

# Python runtime config
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install deps first (layer cache)
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# App source
COPY app ./app
COPY seed_managers.py .

RUN chown -R meridian:meridian /app
USER meridian

EXPOSE 8000

# Railway sets $PORT dynamically; default to 8000 for local docker runs.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
