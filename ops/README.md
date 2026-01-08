# Operations & Deployment

This directory contains the operational logic for `self-praxis.help`, a personal monorepo hosting multiple applications.

## Infrastructure Architecture

*   **Public Frontend (VPS)**: Runs Nginx. Handles TLS termination and routes traffic.
    *   **Production Routing**:
        *   `/` -> **Codenames** (Port 8000)
        *   `/codenames` -> **Codenames** (Port 8000)
        *   `/series-bible` -> **Series Bible** (Port 8001)
    *   **Staging Routing**:
        *   `https://staging.self-praxis.help` -> **Staging Slot** (Port 8009)
*   **Private Backend (Nuc)**: Runs Docker containers via Docker Compose. Accessible via Tailscale.
    *   **Repo Location**: `/srv/selfpraxis`

## Deployment Workflow

All commands are run from the `ops/` directory using `just`.

### 1. Secrets Management (SOPS)
We use SOPS to manage `.env` files. Secrets are committed as encrypted `secrets.enc.env` files.

**If you edit a `.env` file (e.g., `apps/codenames/.env`), you must re-encrypt it:**
```bash
just save-secrets
git commit -am "update secrets"
```

**If you pull fresh code/secrets:**
```bash
just load-secrets
```

### 2. Staging Deployment (Shared Slot)
Deploy a specific app to the shared staging slot (`staging.self-praxis.help`) for preview. This overwrites whatever was there previously.

```bash
# Usage: just deploy-staging <app-name>
just deploy-staging codenames
# URL: https://staging.self-praxis.help
```

### 3. Production Deployment
Deploy an app to its permanent production slot (updates code, pushes secrets, rebuilds container).

```bash
# Usage: just deploy <app-name>
just deploy codenames
just deploy series-bible
```

### 4. Infrastructure Updates
If you change the Nginx routing configuration (`ops/nginx/prod-selfpraxis.conf`):

```bash
just deploy-vps-nginx
```

## Directory Structure

*   **`Justfile`**: The command runner.
*   **`docker-compose.yml`**: Defines the services (`codenames`, `series-bible`, `staging`).
*   **`nginx/`**: Contains the production Nginx configuration.
*   **`.env`**: (GitIgnored) Contains sensitive IPs and paths.
*   **`secrets.enc.env`**: Encrypted version of `.env`.
