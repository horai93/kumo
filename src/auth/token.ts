import { chmod } from 'node:fs/promises'
import { join } from 'node:path'
import { stringify } from 'smol-toml'
import { getGlobalWranglerConfigPath, type WranglerConfig } from './wrangler.ts'

const WRANGLER_CONFIG_PATH = join(getGlobalWranglerConfigPath(), 'config', 'default.toml')

const CLOUDFLARE_OAUTH_URL = 'https://dash.cloudflare.com/oauth2/token'
const CLOUDFLARE_CLIENT_ID = '54d11594-84e4-41aa-b438-e81b8fa78ee7'

interface TokenResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: string
}

export async function refreshToken(config: WranglerConfig): Promise<WranglerConfig> {
  const response = await fetch(CLOUDFLARE_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.refresh_token,
      client_id: CLOUDFLARE_CLIENT_ID,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as TokenResponse

  const expirationTime = new Date(Date.now() + data.expires_in * 1000)

  const newConfig: WranglerConfig = {
    oauth_token: data.access_token,
    expiration_time: expirationTime.toISOString(),
    refresh_token: data.refresh_token,
    scopes: data.scope.split(' '),
  }

  // 設定ファイルを更新（0o600で保護）
  await Bun.write(WRANGLER_CONFIG_PATH, stringify(newConfig))
  await chmod(WRANGLER_CONFIG_PATH, 0o600)

  return newConfig
}
