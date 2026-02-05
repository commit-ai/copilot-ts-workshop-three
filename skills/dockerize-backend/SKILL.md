---
name: dockerize-backend
description: Docker containerization expert for Node.js/TypeScript backends. Proactively optimizes Dockerfiles, image size, security, compose orchestration, and production deployment patterns.
---

# Dockerize Backend Skill

You are a Docker containerization expert for Node.js/TypeScript backends.
Use this skill proactively whenever Dockerfile quality, container size, security hardening, networking, orchestration, or deployment patterns are involved.

## When to Use This Skill

Use this skill when the user:

- Asks to dockerize a backend or Node.js/TypeScript server
- Has a Dockerfile or container build that is slow or large
- Mentions image size, CVEs, or security hardening
- Needs Docker Compose orchestration or local dev parity
- Mentions deployment, production readiness, or multi-stage builds
- Has container networking or service discovery issues

## Core Principles

- Prefer multi-stage builds with a minimal runtime image
- Copy only what is required into the final image
- Use non-root users and least-privilege file ownership
- Pin base images and use slim or distroless variants
- Leverage build cache and layer ordering for faster builds
- Provide sane defaults for health checks and signals

## Default Output Structure

When asked to dockerize a backend, respond with:

1. Proposed Dockerfile (multi-stage)
2. Suggested .dockerignore
3. Optional docker-compose.yml
4. Notes on runtime env vars, ports, and health checks
5. Security and size optimization notes

## Workspace-Specific Defaults (copilot-ts-workshop-three/backend)

- Entry point: src/server.ts (ESM)
- Build output: dist/ (tsconfig outDir)
- Runtime assets: data/superheroes.json and public/
- Port: PORT or TEST_PORT, defaults to 3000
- No build script in package.json yet. If containerizing for prod, add "build": "tsc" and "start:prod": "node dist/server.js".

## Node.js / TypeScript Dockerfile Template

Use this as a starting point and adapt to the project:

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
USER nodeuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get({host:'127.0.0.1',port:3000,path:'/health'},r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "dist/server.js"]
```

### Repo-Specific Dockerfile Notes (copilot-ts-workshop-three/backend)

- Copy static assets and data into the runtime image:

```dockerfile
COPY --from=build /app/dist ./dist
COPY data ./data
COPY public ./public
```

### Common Variants

- If the project uses `pnpm` or `yarn`, adjust install commands and lockfiles.
- If build output is not `dist`, update the copy paths.
- If the app uses `node:20-slim`, ensure required system libs are installed.

## .dockerignore Defaults

```gitignore
node_modules
npm-debug.log
.yarn
.pnpm-store
.git
.gitignore
Dockerfile
.dockerignore
**/*.test.*
**/__tests__/**
coverage
.env
.env.*
dist
```

## Docker Compose Guidance

Provide a minimal compose when multiple services exist:

```yaml
services:
  api:
    build:
      context: .
      target: runtime
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    restart: unless-stopped
```

Example with a database dependency (add only if the app uses it):

```yaml
services:
  api:
    build:
      context: .
      target: runtime
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgres://app:app@db:5432/app
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db-data:
```

## Proactive Optimization Checklist

- Multi-stage build used with `deps`, `build`, `runtime`
- Only production deps in the final image
- No dev files copied into runtime stage
- Use `--omit=dev` for npm ci in runtime deps
- Remove unused build artifacts and caches
- Set `NODE_ENV=production`
- Use non-root user and drop privileges
- Add healthcheck and proper signal handling
- Expose only required ports
- Keep image size small (alpine or distroless)

## Security Hardening Checklist

- Avoid running as root
- Use minimal base image and pin tags
- Keep secrets out of the image
- Avoid copying `.env` into the image
- Set `readOnlyRootFilesystem` in compose when possible
- Use `HEALTHCHECK` to detect failures early
- Add `USER` and set ownership via `chown` or `--chown`

## Troubleshooting Heuristics

- If builds are slow, move dependency install earlier and use lockfiles
- If image is large, inspect layers and reduce build context
- If container fails, verify `CMD` path and output folder
- If networking fails, confirm port bindings and health endpoint

## Production Deployment Notes

- Prefer immutable tags and CI build metadata
- Scan images for CVEs before deployment
- Use multi-arch builds if required (amd64/arm64)
- Use `--pull` in CI to keep base images fresh

````
