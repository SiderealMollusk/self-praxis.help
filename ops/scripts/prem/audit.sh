#!/bin/bash
set -e

# Ops Security Acceptance Test (Audit)
# Usage: ./audit.sh [TARGET_URL]
# Default: https://unvetted.net

TARGET="${1:-https://unvetted.net}"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔒 Starting Security Audit against $TARGET"
echo "------------------------------------------------"

# 1. Header Security (Helmet/Nginx)
echo -n "Checking Security Headers... "
HEADERS=$(curl -s -I "$TARGET")

if echo "$HEADERS" | grep -q "X-Frame-Options: SAMEORIGIN" && \
   echo "$HEADERS" | grep -q "Content-Security-Policy"; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
    echo "Missing Headers. Got:"
    echo "$HEADERS" | grep -E "X-Frame|Content-Security"
    # Don't exit, keep checking
fi

# 2. Input Validation (Zod)
echo -n "Checking Input Validation (Shift Signups)... "
# Send Bad Data (Invalid Key Format)
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"key": "DROP TABLE", "value": "hacker"}' \
    "$TARGET/shift-signups/api/shift")

if [ "$RESPONSE_CODE" -eq 400 ]; then
    echo -e "${GREEN}PASS${NC} (Rejected with 400)"
else
    echo -e "${RED}FAIL${NC} (Expected 400, got $RESPONSE_CODE)"
fi

# 3. Rate Limiting (Nginx)
echo -n "Checking Rate Limiting (Hammering API)... "
# We expect 5 req/s limit. We send 15 requests as fast as possible.
# At least one should probably fail with 503 if we enter the burst zone effectively.
# Actually, burst=10 means we might absorb all 15 if spread slightly. 
# Let's send 30.
FAIL_COUNT=0
for i in {1..30}; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/shift-signups/api/data")
    if [ "$CODE" -eq 503 ]; then
        FAIL_COUNT=$((FAIL_COUNT+1))
    fi
done

if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${GREEN}PASS${NC} (Rate Limit Triggered: $FAIL_COUNT requests blocked)"
else
    echo -e "${RED}WARNING${NC} (No 503s received. Rate limit might be too loose or curl is too slow)"
fi

# 4. Information Leakage
echo -n "Checking Server Tokens (Information Leakage)... "
# Should NOT see "Nginx/1.18" or "Express"
if echo "$HEADERS" | grep -i "Server" | grep -q "nginx/"; then
     echo -e "${RED}FAIL${NC} (Nginx version verified: $(echo "$HEADERS" | grep -i "Server"))"
elif echo "$HEADERS" | grep -i "X-Powered-By"; then
     echo -e "${RED}FAIL${NC} (X-Powered-By header found)"
else
     echo -e "${GREEN}PASS${NC} (Version hidden)"
fi

echo "------------------------------------------------"
echo "Audit Complete."
