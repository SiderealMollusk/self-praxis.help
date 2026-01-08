#!/bin/bash
set -e

APP_NAME=$1
if [ -z "$APP_NAME" ]; then
    echo "Usage: $0 <app_name>"
    exit 1
fi

# Path to the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
APP_DIR="$REPO_ROOT/apps/$APP_NAME"

# Read Configuration from App Specific .env
# We trust the deployment process to have placed the correct .env here or we use the one in repo
if [ -f "$APP_DIR/.env" ]; then
    set -a
    source "$APP_DIR/.env"
    set +a
fi

GIT_SHA=$(git rev-parse --short HEAD)

# Output Info
echo "Generating site for $APP_NAME..."
echo "  Codename: $CODENAME"
echo "  SHA:      $GIT_SHA"

# Generate content
sed -e "s|__CODENAME__|$CODENAME|g" \
    -e "s|__GIT_SHA__|$GIT_SHA|g" \
    "$APP_DIR/site/index.template.html" > "$APP_DIR/site/index.html"

echo "Done. Generated $APP_DIR/site/index.html"
