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

## Runbook: Adding a New App

1.  **Create the App Directory**
    *   Create `apps/<kebab-name>/`
    *   Add your `Dockerfile` and source code.
    *   Add `apps/<kebab-name>/.env` (ensure it is gitignored).
    *   Run `just save-secrets` in `ops/` to encrypt it.

2.  **Register Backend (Docker)**
    *   Edit `ops/docker-compose.yml`.
    *   Copy an existing service definition.
    *   **Crucial**: Assign a UNIQUE Host Port (e.g., `8003:80`).
    *   Update the Service Name and Image Name tags.

3.  **Register Frontend (Nginx)**
    *   Edit `ops/nginx/prod-selfpraxis.conf`.
    *   Add an `upstream` block pointing to the Nuc IP and your NEW Port.
    *   Add a `location` block to route traffic (e.g., `/my-new-app/`).

4.  **Deploy**
    *   Commit your changes: `git commit -am "feat: add <kebab-name>"`
    *   Update Nginx Routing: `just deploy-vps-nginx`
    *   Deploy the App: `just deploy <kebab-name>`
