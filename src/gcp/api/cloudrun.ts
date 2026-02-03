import type { GcpClient } from './client.ts'

const RUN_API_BASE = 'https://run.googleapis.com/v2'

export type Job = {
  name: string // projects/{project}/locations/{location}/jobs/{job}
  uid: string
  createTime: string
  updateTime: string
}

type JobsResponse = {
  jobs?: Job[]
  nextPageToken?: string
}

export function parseJobName(fullName: string): { project: string; location: string; job: string } {
  // Format: projects/{project}/locations/{location}/jobs/{job}
  const parts = fullName.split('/')
  return {
    project: parts[1] ?? '',
    location: parts[3] ?? '',
    job: parts[5] ?? '',
  }
}

export async function getJobs(
  client: GcpClient,
  projectId: string,
  location: string
): Promise<Job[]> {
  const jobs: Job[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`${RUN_API_BASE}/projects/${projectId}/locations/${location}/jobs`)
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const response = await client.request<JobsResponse>(url.toString())
    if (response.jobs) {
      jobs.push(...response.jobs)
    }
    pageToken = response.nextPageToken
  } while (pageToken)

  return jobs
}

export function getCloudRunJobConsoleUrl(
  projectId: string,
  location: string,
  jobName: string
): string {
  return `https://console.cloud.google.com/run/jobs/details/${location}/${jobName}?project=${projectId}`
}

// Common Cloud Run regions
export const CLOUD_RUN_REGIONS = [
  'asia-northeast1',
  'asia-northeast2',
  'asia-east1',
  'asia-southeast1',
  'us-central1',
  'us-east1',
  'us-west1',
  'europe-west1',
  'europe-west4',
] as const
