import { homedir } from 'node:os'
import { join } from 'node:path'

export interface AdcCredentials {
  client_id: string
  client_secret: string
  refresh_token: string
  type: string
  quota_project_id?: string
}

const ADC_PATH = join(homedir(), '.config', 'gcloud', 'application_default_credentials.json')

export async function loadAdcCredentials(): Promise<AdcCredentials> {
  const file = Bun.file(ADC_PATH)
  if (!(await file.exists())) {
    throw new Error(`ADC not found at ${ADC_PATH}\nRun: gcloud auth application-default login`)
  }

  const content = await file.text()
  const credentials = JSON.parse(content) as AdcCredentials

  if (credentials.type !== 'authorized_user') {
    throw new Error(`Unsupported ADC type: ${credentials.type}`)
  }

  return credentials
}
