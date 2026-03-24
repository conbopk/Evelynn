# =============================================================================
# Stage 1 — builder: install Python deps into a venv
# =============================================================================
# Stage 1 — builder
FROM ubuntu:24.04 AS builder

# System deps needed to compile some wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.12 python3.12-venv python3-pip \
    git build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy only requirements first (layer cache-friendly)
COPY requirements/ requirements/

# Install base + GPU deps into a venv
RUN python3.12 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements/gpu.txt


# =============================================================================
# Stage 2 — runtime image
# =============================================================================
# Use the NVIDIA CUDA base for GPU support.
# Swap to python:3.12-slim for CPU-only deployments.
FROM nvidia/cuda:12.6.3-cudnn-runtime-ubuntu24.04 AS runtime

# Install Python 3.12 (not included in CUDA base)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.12 \
    libpython3.12 \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf python3.12 /usr/bin/python3 \
    && ln -sf python3.12 /usr/bin/python

# Copy venv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# App
WORKDIR /app
COPY app/ app/

# Model cache volume mount point
RUN mkdir -p /models
VOLUME ["/models"]

# Non-root user
RUN useradd -m -u 1001 appuser && chown -R appuser /app /models
USER appuser

# Environment defaults (override via docker-compose /k8s)
ENV ENV=production \
    LOG_FORMAT=json \
    HOST=0.0.0.0 \
    PORT=8000 \
    WORKERS=1  \
    HF_HUB_CACHE=/models \
    HF_XET_HIGH_PERFORMANCE=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
            CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/v1/healthz')"

CMD ["sh", "-c", "uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS"]