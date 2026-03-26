#!/usr/bin/env bash
# =============================================================================
# Production startup script for the inference service.
# Performs basic pre-flight checks before launching uvicorn.
# =============================================================================
set -euo pipefail

log() { echo "[start.sh] $*"; }

# —————————————————————————————————————————————————————————————————————————————
# Required env vars
# —————————————————————————————————————————————————————————————————————————————
REQUIRED=(
  "API_KEYS"
  "AWS_ACCESS_KEY_ID"
  "AWS_SECRET_ACCESS_KEY"
  "AWS_S3_BUCKET_NAME"
  "AWS_REGION"
)

missing=()
for var in "${REQUIRED[@]}"; do
  if [[ -z "${!var:-}" ]]; then
      missing+=("$var")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
    log "ERROR: Missing required environment variables:"
    for v in "${missing[@]}"; do
        log "  - $v"
    done
    exit 1
fi

# —————————————————————————————————————————————————————————————————————————————
# GPU check (warn, don't fail — allows CPU fallback)
# —————————————————————————————————————————————————————————————————————————————
if command -v nvidia-smi &>/dev/null; then
  log "GPU info:"
  nvidia-smi --query-gpu=name,memory.total --format=csv,noheader | sed 's/^/  /'
else
  log 'WARNING: nvidia-smi not found — running on CPU'
fi

# —————————————————————————————————————————————————————————————————————————————
# Launch
# —————————————————————————————————————————————————————————————————————————————
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
WORKERS="${WORKERS:-1}"
LOG_LEVEL_UV=$(echo "${LOG_LEVEL:-info}" | tr '[:upper:]' '[:lower:]')

log "Starting Evelynn Inference Service"
log "  ENV     : ${ENV:-production}"
log "  Host     : ${HOST}:${PORT}"
log "  Workers     : ${WORKERS}"
log "  Model     : ${MODEL_ID:-Tongyi-MAI/Z-Image-Turbo}"

exec uvicorn app.main:app \
  --host "$HOST" \
  --port "$PORT" \
  --workers "$WORKERS" \
  --log-level "$LOG_LEVEL_UV" \
  --no-access-log