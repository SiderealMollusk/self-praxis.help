#!/bin/bash
set -e

# Usage: ./get-inactive-color.sh [user@vps_host]
VPS_HOST=$1

# Get active color using the sibling script
ACTIVE=$("$(dirname "$0")/get-active-color.sh" "$VPS_HOST")

if [ "$ACTIVE" == "blue" ]; then
    echo "green"
elif [ "$ACTIVE" == "green" ]; then
    echo "blue"
else
    echo "unknown"
    exit 1
fi
