import { loadAdcCredentials, type AdcCredentials } from './adc.ts'
import { getAccessToken } from './token.ts'

export type { AdcCredentials }

let cachedCredentials: AdcCredentials | null = null

export async function getGcpToken(): Promise<string> {
  if (!cachedCredentials) {
    cachedCredentials = await loadAdcCredentials()
  }
  return getAccessToken(cachedCredentials)
}

export async function getQuotaProjectId(): Promise<string | undefined> {
  if (!cachedCredentials) {
    cachedCredentials = await loadAdcCredentials()
  }
  return cachedCredentials.quota_project_id
}
