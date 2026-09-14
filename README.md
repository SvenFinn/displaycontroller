# displaycontroller

## Build orchestration migration

This repository now includes an Nx + pnpm workspace layer for build orchestration.

Current rollout status:

- Runtime orchestration remains Docker Compose.
- Image builds and release packaging remain unchanged.
- Workspace builds are orchestrated with Nx and pnpm.
- A dedicated GitHub Actions workflow (`workspace-build.yml`) validates Nx builds in CI.

## Local workspace commands

From `/home/runner/work/displaycontroller/displaycontroller`:

- Install dependencies: `pnpm install`
- Build all buildable packages: `pnpm build`
- Build only affected projects: `pnpm build:affected`
- Open dependency graph: `pnpm graph`

## Why Nx + pnpm here

- Better fit for many interdependent TypeScript packages.
- Incremental, cacheable builds based on project dependencies.
- Lower migration complexity than Bazel while keeping room for future Bazel adoption if strategic requirements change.