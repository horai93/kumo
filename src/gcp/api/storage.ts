import type { GcpClient } from './client.ts'

const GCS_API_BASE = 'https://storage.googleapis.com/storage/v1'
const MAX_RESULTS = 1000

export interface Bucket {
  name: string
  location: string
  storageClass: string
}

interface BucketsResponse {
  items?: Bucket[]
  nextPageToken?: string
}

export async function getBuckets(client: GcpClient, projectId: string): Promise<Bucket[]> {
  const buckets: Bucket[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`${GCS_API_BASE}/b`)
    url.searchParams.set('project', projectId)
    url.searchParams.set('maxResults', String(MAX_RESULTS))
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const response = await client.request<BucketsResponse>(url.toString())
    if (response.items) {
      buckets.push(...response.items)
    }
    pageToken = response.nextPageToken
  } while (pageToken && buckets.length < MAX_RESULTS)

  return buckets
}

export function getGcsConsoleUrl(bucketName: string): string {
  return `https://console.cloud.google.com/storage/browser/${bucketName}`
}
