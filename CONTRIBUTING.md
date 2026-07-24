# Contributing to KasirSolo POS

Thanks for your interest in contributing! This guide will help you get started.

## Prerequisites

- Node.js >= 18
- pnpm 10+

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run lint, typecheck, and build
pnpm turbo run lint
pnpm turbo run typecheck
pnpm turbo run build
```

## E2E Tests

```bash
# Install Playwright browsers
pnpm exec playwright install --with-deps

# Run all e2e tests
pnpm test:e2e

# Run specific test suites
pnpm test:retail
pnpm test:fnb
```

## Code Style

- Follow the existing code patterns in each app.
- Run `pnpm turbo run lint` before committing.
- TypeScript is used throughout — no `any` unless absolutely necessary.

## Pull Requests

1. Create a feature branch from `main`.
2. Make your changes and ensure CI passes.
3. Open a PR using the provided template.
4. Request a review from the team.

## Commit Messages

Use clear, descriptive commit messages. Prefer conventional commits:

- `feat(admin): add user roles`
- `fix(kasir-retail): correct tax calculation`
- `chore: update dependencies`

## Questions?

Open a discussion or reach out to the maintainers.
