import type { CloudflareApiResponse } from './types.ts'

const API_BASE = 'https://api.cloudflare.com/client/v4'

export class CloudflareClient {
  constructor(private token: string) {}

  async request<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as CloudflareApiResponse<T>

    if (!data.success) {
      const errorMessages = data.errors.map((e) => e.message).join(', ')
      throw new Error(`Cloudflare API error: ${errorMessages}`)
    }

    return data.result
  }
}
