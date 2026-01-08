# Operations & Deployment

This directory contains the operational logic for `self-praxis.help`, implementing a **Blue/Green Deployment Strategy** on a split infrastructure.

## Infrastructure Architecture

*   **Public Frontend (VPS)**: Runs Nginx as a Load Balancer / Reverse Proxy. Handles TLS termination and routes traffic to the active backend.
*   **Private Backend (Nuc)**: Runs Docker containers. Accessible via Tailscale.
    *   **Staging**: Port `8001` (Always live).
    *   **Production Blue**: Port `8000`.
    *   **Production Green**: Port `8002`.

## Deployment Workflow

All commands are run from the `ops/` directory using `just`.

### 1. Staging Deployment
Deploy immediately to the staging slot to verify changes.

```bash
# 1. Commit and Push your changes (Required!)
git add . && git commit -m "..." && git push

# 2. Deploy
just deploy-staging

# 3. Verify (on Tailscale)
# Visit http://100.104.75.126:8001
```

### 2. Production Deployment (Blue/Green)
Production uses a zero-downtime Blue/Green strategy. You always deploy to the *inactive* slot (the color not currently live), verify it, and then flip the traffic.

**Step A: Check Status**
See which color is currently live.
```bash
just active-color
# Output: "blue" or "green"
```

**Step B: Deploy to Candidate**
This automatically detects the *inactive* slot and deploys the latest code to it.
```bash
just deploy-prod
```

**Step C: Verify Candidate**
Wait for the container to start, then verify it is healthy. This checks the specific port of the inactive slot.
```bash
just verify-next
# Output: HTTP 200 OK ...
```

**Step D: Promote (Go Live)**
Switch the VPS traffic to the new version.
```bash
just promote
```

## Directory Structure

*   **`Justfile`**: The command center. Run `just` to see all recipes.
*   **`scripts/`**: Helper scripts organized by where they run:
    *   **`dev/`**: Helper logic that runs on your local machine (e.g., determining the active color).
    *   **`prem/`**: Scripts executed on the Nuc (e.g., site generation).
    *   **`vps/`**: Scripts executed on the VPS (e.g., checking configuration).
*   **`docker-compose.yml`**: Defines the services (Prod Blue, Prod Green, Staging).
*   **`.env`**: (GitIgnored) Contains sensitive IPs and paths.
