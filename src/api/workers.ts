import { CloudflareClient } from './client.ts'
import type { Account, Worker } from './types.ts'

export async function getAccounts(client: CloudflareClient): Promise<Account[]> {
  return client.request<Account[]>('/accounts')
}

export async function getWorkers(client: CloudflareClient, accountId: string): Promise<Worker[]> {
  return client.request<Worker[]>(`/accounts/${accountId}/workers/scripts`)
}

export function getWorkerDashboardUrl(accountId: string, workerName: string): string {
  return `https://dash.cloudflare.com/${accountId}/workers/services/view/${workerName}/production`
}
