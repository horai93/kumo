# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev             # Run CLI in development mode
bun run dev -- list     # Run with subcommand (e.g., list, open, config:get-account)
bun run check           # Type check with tsgo (TypeScript 7)
bun run lint            # Lint with oxlint
bun run fmt             # Format with oxfmt
bun run build           # Build single-file executable
```

## Architecture

kumo is a CLI tool for managing Cloudflare Workers. It uses wrangler's stored OAuth credentials (`~/.wrangler/config/default.toml`) to authenticate with the Cloudflare API.

### Directory Structure

- `src/auth/` - Wrangler config loading and OAuth token management
- `src/api/` - Cloudflare API client and typed responses
- `src/commands/` - CLI commands defined with gunshi's `define()`
- `src/config/` - User config storage (`~/.config/kumo/config.json`)
- `src/ui/` - TUI components (spinner, worker selection with search)

### Key Patterns

- CLI framework: gunshi with subcommands registered via `cli()` in main.ts
- Interactive prompts: @inquirer/prompts (search, select)
- All commands follow the pattern: validate auth → fetch data → display/interact
- Subcommands use colon-separated names (e.g., `config:get-account`)

### Build

Uses Bun's `--compile` flag to create a single executable binary (~57MB). Cross-compilation supported via `--target` flag.
