import { chmod, mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface KumoConfig {
  defaultAccountId?: string
}

const CONFIG_DIR = join(homedir(), '.config', 'kumo')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')

export async function loadConfig(): Promise<KumoConfig> {
  const file = Bun.file(CONFIG_PATH)

  if (!(await file.exists())) {
    return {}
  }

  try {
    return (await file.json()) as KumoConfig
  } catch {
    return {}
  }
}

export async function saveConfig(config: KumoConfig): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 })
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2))
  await chmod(CONFIG_PATH, 0o600)
}

export async function getDefaultAccountId(): Promise<string | undefined> {
  const config = await loadConfig()
  return config.defaultAccountId
}

export async function setDefaultAccountId(accountId: string): Promise<void> {
  const config = await loadConfig()
  config.defaultAccountId = accountId
  await saveConfig(config)
}
