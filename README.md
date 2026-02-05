# kumo

Cloudflare Workers TUI manager. Quickly list and open your Workers in the browser.

## Features

### Cloudflare Workers
- Interactive Worker selection with fuzzy search
- Opens Worker dashboard directly in browser
- Uses existing wrangler OAuth credentials
- Multi-account support with default account configuration

### Google Cloud
- BigQuery: Select dataset/table and copy ID
- Cloud Storage: Select bucket and copy URI
- Cloud Run Jobs: Select job and copy name
- Interactive project and resource selection with fuzzy search
- Copies to clipboard by default (or opens in browser with `-w`)

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
sudo mv kumo /usr/local/bin/

# macOS (Intel)
curl -L https://github.com/horai93/kumo/releases/latest/download/kumo-darwin-x64.tar.gz | tar xz
sudo mv kumo /usr/local/bin/

# Linux (x64)
curl -L https://github.com/horai93/kumo/releases/latest/download/kumo-linux-x64.tar.gz | tar xz
sudo mv kumo /usr/local/bin/

# Linux (arm64)
curl -L https://github.com/horai93/kumo/releases/latest/download/kumo-linux-arm64.tar.gz | tar xz
sudo mv kumo /usr/local/bin/
```

## Prerequisites

You need to be logged in with wrangler:

```bash
npx wrangler login
```

kumo reads the OAuth token from `~/.wrangler/config/default.toml`.

## Usage

### Cloudflare Workers

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

### Google Cloud

Requires `gcloud` CLI with authenticated session.

```bash
# BigQuery - select dataset/table and copy ID
kumo gcp:bq
kumo gcp:bq --project <project-id>
kumo gcp:bq -w  # Open in browser

# Cloud Storage - select bucket and copy URI
kumo gcp:gcs
kumo gcp:gcs --project <project-id>

# Cloud Run Jobs - select job and copy name
kumo gcp:run
kumo gcp:run --project <project-id> --region <region>
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
