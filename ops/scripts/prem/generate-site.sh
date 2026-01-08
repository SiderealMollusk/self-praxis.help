#!/bin/bash
set -e

# Path to the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)

# Read Configuration
if [ -f "$REPO_ROOT/ops/.env" ]; then
    set -a
    source "$REPO_ROOT/ops/.env"
    set +a
fi

GIT_SHA=$(git rev-parse --short HEAD)

# Output Info
echo "Generating site..."
echo "  Codename: $CODENAME"
echo "  SHA:      $GIT_SHA"

# Generate content
sed -e "s|__CODENAME__|$CODENAME|g" \
    -e "s|__GIT_SHA__|$GIT_SHA|g" \
    "$REPO_ROOT/site/index.template.html" > "$REPO_ROOT/site/index.html"

echo "Done. Generated site/index.html"
