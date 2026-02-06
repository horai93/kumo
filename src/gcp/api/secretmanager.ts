import type { GcpClient } from './client.ts'

const SECRET_MANAGER_API_BASE = 'https://secretmanager.googleapis.com/v1'

export interface SecretResource {
  name: string
  createTime: string
}

interface SecretsResponse {
  secrets?: SecretResource[]
  nextPageToken?: string
}

export function parseSecretName(fullName: string): { project: string; secret: string } {
  // format: projects/{project}/secrets/{secret}
  const parts = fullName.split('/')
  return { project: parts[1] ?? '', secret: parts[3] ?? '' }
}

export async function getSecrets(client: GcpClient, projectId: string): Promise<SecretResource[]> {
  const secrets: SecretResource[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`${SECRET_MANAGER_API_BASE}/projects/${projectId}/secrets`)
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const response = await client.request<SecretsResponse>(url.toString())
    if (response.secrets) {
      secrets.push(...response.secrets)
    }
    pageToken = response.nextPageToken
  } while (pageToken)

  return secrets
}

export function getSecretConsoleUrl(projectId: string, secretName: string): string {
  return `https://console.cloud.google.com/security/secret-manager/secret/${secretName}/versions?project=${projectId}`
}
