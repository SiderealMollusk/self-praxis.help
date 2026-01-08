# Operations & Deployment

## Staging + Blue/Green Production (Docker image tags)

This document outlines the deployment strategy for `self-praxis.help`.

### Goal
*   **Permanent Staging**: Keep a dedicated staging environment.
*   **Blue/Green Production**: Run two production stacks (blue + green) to enable zero-downtime deployments and instant rollbacks.
*   **Tag-based Versioning**: Avoid directory confusion. Blue/Green differ only by the Docker image tag running in the container.

### Architecture

**Infrastructure**:
*   **VPS (Public)**: Runs `nginx` + TLS. Terminates internet traffic.
*   **Nuc (Private)**: Runs Docker runtime. Reachable only via Tailscale.
*   **Network**: Staging and Backend ports are accessible *only* via the Tailscale network.

**Directory Layout (on Nuc)**:
*   `/srv/selfpraxis/prod`: Source-of-truth for PROD builds.
*   `/srv/selfpraxis/staging`: Source-of-truth for STAGING builds.
*   `/srv/selfpraxis/docker`: Contains `docker-compose.yml` and orchestration state.

### 1. Build Images

Images are built on the Nuc from the respective source directories.

*   **Production**: `selfpraxis:prod-<short-sha>`
*   **Staging**: `selfpraxis:staging-<short-sha>`

### 2. Service Definition

See `ops/docker-compose.yml` for the canonical configuration.

**Port Allocation (Tailscale IP)**:
*   **Prod Blue**: `8000` (Container: 8000/80)
*   **Staging**: `8001` (Container: 8000/80)
*   **Prod Green**: `8002` (Container: 8000/80)

### 3. VPS Configuration (Nginx)

The public VPS routes traffic based on an upstream snippet file `selfpraxis-prod-upstream.conf`.

**Blue Active**:
```nginx
upstream selfpraxis_prod_active { server 100.104.75.126:8000; }
```

**Green Active**:
```nginx
upstream selfpraxis_prod_active { server 100.104.75.126:8002; }
```

### 4. Deployment Procedure

#### A) Deploy to Staging
1.  **Update Source**: `cd /srv/selfpraxis/staging && git pull`
2.  **Build**: `docker build -t selfpraxis:staging-$(git rev-parse --short HEAD) .`
3.  **Update Compose**: Edit `docker-compose.yml` to use the new staging tag.
4.  **Apply**: `docker compose up -d staging`
5.  **Verify**: `curl -I https://staging.self-praxis.help`

#### B) Deploy to Production (Blue/Green)
1.  **Identify Active Color**: Check which port/color is currently live.
    *   **Option A (Script)**: Run `./ops/bin/check-vps-active.sh` on the VPS.
    *   **Option B (Manual)**: `grep server /etc/nginx/snippets/selfpraxis-prod-upstream.conf`
        *   `8000` = **BLUE**
        *   `8002` = **GREEN**
2.  **Update Source**: `cd /srv/selfpraxis/prod && git pull`
3.  **Build**: `docker build -t selfpraxis:prod-$(git rev-parse --short HEAD) .`
4.  **Target Inactive**: Update `docker-compose.yml` for the *inactive* color (e.g., if Blue is live, update Green).
5.  **Apply**: `docker compose up -d prod_green` (or `prod_blue`).
6.  **Verify Internal**: Curl the direct IP:Port of the new container (`100.104.75.126:8002`).
7.  **Flip Traffic**: Edit `/etc/nginx/snippets/selfpraxis-prod-upstream.conf` on the VPS.
8.  **Reload**: `nginx -t && systemctl reload nginx`.
9.  **Verify Public**: Check `https://self-praxis.help`.

### 5. Rules
*   **No Directories**: Do NOT create `prod-blue/` or `prod-green/` directories.
*   **Immutable Containers**: Never edit running containers.
*   **Staging != Green**: Staging is a permanent, separate environment.