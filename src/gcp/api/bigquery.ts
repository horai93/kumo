import type { GcpClient } from './client.ts'

const BQ_API_BASE = 'https://bigquery.googleapis.com/bigquery/v2'
const MAX_RESULTS = 1000

export interface Dataset {
  datasetReference: {
    datasetId: string
    projectId: string
  }
  friendlyName?: string
}

export interface Table {
  tableReference: {
    tableId: string
    datasetId: string
    projectId: string
  }
  friendlyName?: string
  type: string
}

interface DatasetsResponse {
  datasets?: Dataset[]
  nextPageToken?: string
}

interface TablesResponse {
  tables?: Table[]
  nextPageToken?: string
}

export async function getDatasets(client: GcpClient, projectId: string): Promise<Dataset[]> {
  const datasets: Dataset[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`${BQ_API_BASE}/projects/${projectId}/datasets`)
    url.searchParams.set('maxResults', String(MAX_RESULTS))
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const response = await client.request<DatasetsResponse>(url.toString())
    if (response.datasets) {
      datasets.push(...response.datasets)
    }
    pageToken = response.nextPageToken
  } while (pageToken && datasets.length < MAX_RESULTS)

  return datasets
}

export async function getTables(
  client: GcpClient,
  projectId: string,
  datasetId: string
): Promise<Table[]> {
  const tables: Table[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`${BQ_API_BASE}/projects/${projectId}/datasets/${datasetId}/tables`)
    url.searchParams.set('maxResults', String(MAX_RESULTS))
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const response = await client.request<TablesResponse>(url.toString())
    if (response.tables) {
      tables.push(...response.tables)
    }
    pageToken = response.nextPageToken
  } while (pageToken && tables.length < MAX_RESULTS)

  return tables
}

export function getBqConsoleUrl(projectId: string, datasetId: string, tableId?: string): string {
  if (tableId) {
    return `https://console.cloud.google.com/bigquery?project=${projectId}&ws=!1m5!1m4!4m3!1s${projectId}!2s${datasetId}!3s${tableId}`
  }
  return `https://console.cloud.google.com/bigquery?project=${projectId}&ws=!1m4!1m3!3m2!1s${projectId}!2s${datasetId}`
}
