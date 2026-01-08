#!/bin/bash
set -e

# This script is intended to be run on the VPS to check which environment is live.

UPSTREAM_FILE="/etc/nginx/snippets/selfpraxis-prod-upstream.conf"

if [ ! -f "$UPSTREAM_FILE" ]; then
    echo "Error: Upstream configuration file not found at $UPSTREAM_FILE"
    echo "Are you running this on the VPS?"
    exit 1
fi

if grep -q "8000" "$UPSTREAM_FILE"; then
    echo "🔵 BLUE is ACTIVE (Port 8000)"
elif grep -q "8002" "$UPSTREAM_FILE"; then
    echo "🟢 GREEN is ACTIVE (Port 8002)"
else
    echo "⚠️  UNKNOWN state. Could not determine active color from file."
    cat "$UPSTREAM_FILE"
fi
