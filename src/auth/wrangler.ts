import { statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parse } from 'smol-toml'

export interface WranglerConfig {
  oauth_token: string
  expiration_time: string
  refresh_token: string
  scopes: string[]
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

export function getGlobalWranglerConfigPath(): string {
  const legacyConfigDir = join(homedir(), '.wrangler')
  const xdgConfigHome = process.env.XDG_CONFIG_HOME || join(homedir(), '.config')
  const xdgConfigDir = join(xdgConfigHome, '.wrangler')

  // Prefer legacy path if it exists
  if (isDirectory(legacyConfigDir)) {
    return legacyConfigDir
  }
  return xdgConfigDir
}

const WRANGLER_CONFIG_PATH = join(getGlobalWranglerConfigPath(), 'config', 'default.toml')

export async function loadWranglerConfig(): Promise<WranglerConfig> {
  const file = Bun.file(WRANGLER_CONFIG_PATH)

  if (!(await file.exists())) {
    throw new Error(
      `Wrangler config not found at ${WRANGLER_CONFIG_PATH}\nRun 'wrangler login' first.`
    )
  }

  const content = await file.text()
  const config = parse(content) as unknown as WranglerConfig

  if (!config.oauth_token) {
    throw new Error('oauth_token not found in wrangler config')
  }

  return config
}

export function isTokenExpired(config: WranglerConfig): boolean {
  const expiration = new Date(config.expiration_time)
  const now = new Date()
  // 5分のバッファを設ける
  return now.getTime() > expiration.getTime() - 5 * 60 * 1000
}
