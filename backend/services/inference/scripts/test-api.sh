#!/usr/bin/env bash
# =============================================================================
# Quick smoke test against a running inference service.
# Usage: ./scripts/test-api.sh [BASE_URL] [API_KEY]
# =============================================================================
set -euo pipefail

BASE_URL="${1:-http://localhost:8000}"
API_KEY="${2:-${API_KEY:-}}"

if [[ -z "$API_KEY" ]]; then
    echo "Usage: $0 <base_url> <api_key>"
    echo "       or set API_KEY env var"
    exit 1
fi

H_AUTH="X-API-Key: $API_KEY"
H_CT="Content-Type: application/json"

pass() { echo "  ✅ $*"; }
fail() { echo "  ❌ $*"; exit 1; }

echo ""
echo "=== Evelynn Inference Service — Smoke Test ==="
echo "    Target: $BASE_URL"
echo ""

# 1. Liveness
echo "1. Liveness probe (/v1/healthz)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/v1/healthz")
[[ "$CODE" == "200" ]] && pass "200 OK" || fail "Expected 200, got $CODE"

# 2. Readiness
echo "2. Readiness probe (/v1/readyz)"
BODY=$(curl -s "$BASE_URL/v1/readyz")
echo "    Response: $BODY"
pass "Got response"

# 3. Auth rejected
echo "3. Generate without API key → 401"
CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/v1/generate" \
  -H "$H_CT" \
  -d '{"prompt":"test"}')
[[ "$CODE" == "401" ]] && pass "401 Unauthorized" || fail "Expected 401, got $CODE"

# 4. Validation error
echo "4. Generate with empty prompt → 422"
CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/v1/generate" \
  -H "$H_CT" -H "$H_AUTH" \
  -d '{"prompt":""}')
[[ "$CODE" == "422" ]] && pass "422 Unprocessable Entity" || fail "Expected 422, got $CODE"

# 5. Metrics endpoint
echo "5. Prometheus metrics (/metrics)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/metrics")
[[ "$CODE" == "200" ]] && pass "200 OK" || fail "Expected 200, got $CODE"

echo ""
echo "=== All smoke tests passed ==="
echo ""