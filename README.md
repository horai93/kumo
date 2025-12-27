# kumo

Cloudflare Workers TUI manager. Quickly list and open your Workers in the browser.

## Features

- Interactive Worker selection with search
- Opens Worker dashboard directly in browser
- Uses existing wrangler OAuth credentials
- Multi-account support with default account configuration

## Installation

### mise

```bash
mise use -g github:horai93/kumo
```

### Manual

Download the latest binary from [Releases](https://github.com/horai93/kumo/releases):

```bash
# macOS (Apple Silicon)
curl -L https://github.com/horai93/kumo/releases/latest/download/kumo-darwin-arm64.tar.gz | tar xz
sudo mv kumo-darwin-arm64 /usr/local/bin/kumo

# macOS (Intel)
curl -L https://github.com/horai93/kumo/releases/latest/download/kumo-darwin-x64.tar.gz | tar xz
sudo mv kumo-darwin-x64 /usr/local/bin/kumo

# Linux (x64)
curl -L https://github.com/horai93/kumo/releases/latest/download/kumo-linux-x64.tar.gz | tar xz
sudo mv kumo-linux-x64 /usr/local/bin/kumo

# Linux (arm64)
curl -L https://github.com/horai93/kumo/releases/latest/download/kumo-linux-arm64.tar.gz | tar xz
sudo mv kumo-linux-arm64 /usr/local/bin/kumo
```

## Prerequisites

You need to be logged in with wrangler:

```bash
npx wrangler login
```

kumo reads the OAuth token from `~/.wrangler/config/default.toml`.

## Usage

```bash
# Interactive mode - select a Worker and open in browser
kumo

# List all Workers
kumo list
kumo list --json

# Open a specific Worker
kumo open <worker-name>

# Set default account (for multi-account users)
kumo config:set-account
kumo config:get-account

# Specify account explicitly
kumo --account <account-id>
kumo list --account <account-id>
```

## Development

```bash
bun install
bun run dev           # Run in development
bun run check         # Type check (tsgo)
bun run lint          # Lint (oxlint)
bun run fmt           # Format (oxfmt)
bun run build         # Build binary
```

## License

MIT
