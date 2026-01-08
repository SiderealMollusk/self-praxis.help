# Operations & Deployment

This directory contains the operational logic for `self-praxis.help`.

## Structure

*   **`scripts/`**: Executable scripts, organized by execution context:
    *   **`vps/`**: Run on the public frontend server (Load Balancer).
    *   **`prem/`**: Run on the private backend server (Docker Host).
    *   **`dev/`**: Run on your local development machine.
*   **`runbooks/`**: Human-readable documentation for operational procedures.
*   **`Justfile`**: The entry point for all operations.

## Quick Start

Run `just` to see available commands.

```bash
cd ops
just
```

## procedures

*   [Deployment Strategy](runbooks/deployment.md)
