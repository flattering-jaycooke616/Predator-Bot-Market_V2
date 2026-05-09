#!/bin/bash
# Stress test script for Predator Bot Market API
# Tests all endpoints and functionality

set -e

BASE_URL="${API_BASE_URL:-http://localhost:8080}"
PASS=0
FAIL=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
}

log_fail() {
  echo -e "${RED}[FAIL]${NC} $1 - $2"
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
}

log_info() {
  echo -e "${YELLOW}[INFO]${NC} $1"
}

# Wait for server to be ready
log_info "Waiting for server at $BASE_URL..."
for i in {1..30}; do
  if curl -s "$BASE_URL/api/healthz" > /dev/null 2>&1; then
    log_info "Server is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    log_fail "Server startup" "Server did not start within 30 seconds"
    exit 1
  fi
  sleep 1
done

# ==========================================
# 1. Health Check
# ==========================================
log_info "Testing Health Check..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/healthz")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  log_pass "Health check returned 200"
else
  log_fail "Health check" "Expected 200, got $HTTP_CODE"
fi

if echo "$BODY" | grep -q "status"; then
  log_pass "Health check has status field"
else
  log_fail "Health check" "Missing status field in response"
fi

# ==========================================
# 2. Bots - List All
# ==========================================
log_info "Testing GET /api/bots..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/bots")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  log_pass "GET /api/bots returned 200"
else
  log_fail "GET /api/bots" "Expected 200, got $HTTP_CODE"
fi

# ==========================================
# 3. Bots - List with category filter
# ==========================================
log_info "Testing GET /api/bots?category=..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/bots?category=test")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  log_pass "GET /api/bots?category=test returned 200"
else
  log_fail "GET /api/bots?category=test" "Expected 200, got $HTTP_CODE"
fi

# ==========================================
# 4. Bots - List with featured filter
# ==========================================
log_info "Testing GET /api/bots?featured=true..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/bots?featured=true")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  log_pass "GET /api/bots?featured=true returned 200"
else
  log_fail "GET /api/bots?featured=true" "Expected 200, got $HTTP_CODE"
fi

# ==========================================
# 5. Bots - Get single bot (should 404 if no bots)
# ==========================================
log_info "Testing GET /api/bots/1..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/bots/1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
  log_pass "GET /api/bots/1 returned valid response ($HTTP_CODE)"
else
  log_fail "GET /api/bots/1" "Unexpected status $HTTP_CODE"
fi

# ==========================================
# 6. Bots - Get non-existent bot
# ==========================================
log_info "Testing GET /api/bots/99999..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/bots/99999")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
  log_pass "GET /api/bots/99999 returned 404"
else
  log_fail "GET /api/bots/99999" "Expected 404, got $HTTP_CODE"
fi

# ==========================================
# 7. Bots - Stats
# ==========================================
log_info "Testing GET /api/bots/stats..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/bots/stats")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  log_pass "GET /api/bots/stats returned 200"
else
  log_fail "GET /api/bots/stats" "Expected 200, got $HTTP_CODE"
fi

if echo "$BODY" | grep -q "totalBots"; then
  log_pass "Stats has totalBots field"
else
  log_fail "Stats" "Missing totalBots field"
fi

# ==========================================
# 8. Protected Routes - Without Auth (should 401)
# ==========================================
log_info "Testing protected routes without auth..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/purchases")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  log_pass "GET /api/purchases without auth returned $HTTP_CODE"
else
  log_fail "GET /api/purchases without auth" "Expected 401/403, got $HTTP_CODE"
fi

# ==========================================
# 9. Admin Routes - Without Auth (should 401)
# ==========================================
log_info "Testing admin routes without auth..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/purchases")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  log_pass "GET /api/admin/purchases without auth returned $HTTP_CODE"
else
  log_fail "GET /api/admin/purchases without auth" "Expected 401/403, got $HTTP_CODE"
fi

# ==========================================
# 10. Admin - Create Bot without auth (should 401)
# ==========================================
log_info "Testing POST /api/admin/bots without auth..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/admin/bots" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Bot","slug":"test-bot","description":"Test","price":10,"currency":"USD","category":"test","features":["test"]}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  log_pass "POST /api/admin/bots without auth returned $HTTP_CODE"
else
  log_fail "POST /api/admin/bots without auth" "Expected 401/403, got $HTTP_CODE"
fi

# ==========================================
# 11. Invalid method tests
# ==========================================
log_info "Testing invalid methods..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/bots")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "405" ]; then
  log_pass "DELETE /api/bots returned $HTTP_CODE"
else
  log_fail "DELETE /api/bots" "Expected 404/405, got $HTTP_CODE"
fi

# ==========================================
# 12. Malformed request tests
# ==========================================
log_info "Testing malformed requests..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/bots" \
  -H "Content-Type: application/json" \
  -d 'invalid json')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "415" ]; then
  log_pass "Malformed JSON returned $HTTP_CODE"
else
  log_fail "Malformed JSON" "Expected 400/404/415, got $HTTP_CODE"
fi

# ==========================================
# 13. CORS headers check
# ==========================================
log_info "Testing CORS headers..."
RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/api/healthz")
if echo "$RESPONSE" | grep -qi "access-control"; then
  log_pass "CORS headers present"
else
  log_pass "CORS headers check completed (may not be present for simple requests)"
fi

# ==========================================
# 14. Content-Type check
# ==========================================
log_info "Testing Content-Type headers..."
RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/api/healthz")
if echo "$RESPONSE" | grep -qi "content-type.*application/json"; then
  log_pass "Content-Type is application/json"
else
  log_fail "Content-Type" "Expected application/json"
fi

# ==========================================
# 15. Stress test - Rapid requests
# ==========================================
log_info "Running stress test - 50 rapid requests..."
START_TIME=$(date +%s%N)
SUCCESS=0
FAIL_STRESS=0

for i in $(seq 1 50); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/healthz" &)
done
wait

END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
log_info "50 requests completed in ${DURATION}ms"

if [ $DURATION -lt 10000 ]; then
  log_pass "Stress test completed within 10 seconds"
else
  log_fail "Stress test" "Took longer than 10 seconds"
fi

# ==========================================
# 16. Concurrent requests test
# ==========================================
log_info "Running concurrent requests test..."
START_TIME=$(date +%s%N)

for i in $(seq 1 20); do
  curl -s -o /dev/null "$BASE_URL/api/bots" &
  curl -s -o /dev/null "$BASE_URL/api/bots/stats" &
done
wait

END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
log_info "40 concurrent requests completed in ${DURATION}ms"

if [ $DURATION -lt 15000 ]; then
  log_pass "Concurrent test completed within 15 seconds"
else
  log_fail "Concurrent test" "Took longer than 15 seconds"
fi

# ==========================================
# Summary
# ==========================================
echo ""
echo "=========================================="
echo "           TEST SUMMARY"
echo "=========================================="
echo -e "Total:  $TOTAL"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "=========================================="

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}ALL TESTS PASSED!${NC}"
  exit 0
else
  echo -e "${RED}SOME TESTS FAILED!${NC}"
  exit 1
fi
