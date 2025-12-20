import { refreshToken } from './token.ts'
import { isTokenExpired, loadWranglerConfig, type WranglerConfig } from './wrangler.ts'

export type { WranglerConfig }

export async function getValidToken(): Promise<string> {
  let config = await loadWranglerConfig()

  if (isTokenExpired(config)) {
    config = await refreshToken(config)
  }

  return config.oauth_token
}
