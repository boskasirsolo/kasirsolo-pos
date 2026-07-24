# kasirsolo-pos

KASIRSOLO — Multi-App POS & Management Platform by PT Mesin Kasir Solo.

A Turborepo monorepo containing Next.js applications for retail POS, food & beverage, admin dashboards, and more — with an offline-first hybrid data strategy (Supabase + IndexedDB).

## Prerequisites

- **Node.js** >= 18
- **pnpm** 10+
- **Git**

Optional (for full local development):

- [Supabase CLI](https://supabase.com/docs/guides/cli) — for local database, auth, and Edge Functions
- [Playwright](https://playwright.dev/) — for end-to-end tests (`pnpm test:e2e`)

## Quick Start

```bash
# Clone and install
git clone https://github.com/boskasirsolo/kasirsolo-pos.git
cd kasirsolo-pos
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start all apps in dev mode
pnpm dev

# Or start a single app
pnpm dev --filter=kasir-retail
```

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm clean` | Clean build artifacts |

## Project Structure

See [`docs/`](./docs/) for detailed architecture, database schema, and per-app documentation.

## Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
