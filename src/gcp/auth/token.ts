import type { AdcCredentials } from './adc.ts'

const GOOGLE_OAUTH_URL = 'https://oauth2.googleapis.com/token'

interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface CachedToken {
  accessToken: string
  expiresAt: number
}

let tokenCache: CachedToken | null = null

export async function getAccessToken(credentials: AdcCredentials): Promise<string> {
  // Check cache with 60s buffer
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60000) {
    return tokenCache.accessToken
  }

  const response = await fetch(GOOGLE_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: credentials.refresh_token,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as TokenResponse

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return data.access_token
}
