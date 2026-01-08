#!/bin/bash
set -e

# Usage: ./get-active-color.sh [user@vps_host]
VPS_HOST=$1

if [ -z "$VPS_HOST" ]; then
    echo "Error: VPS_HOST argument required"
    exit 1
fi

# Remotely execute checks
ACTIVE=$(ssh -q -t "$VPS_HOST" "bash -s -- --raw" < "$(dirname "$0")/../vps/check-active.sh" | tr -d '\r')

echo "$ACTIVE"
