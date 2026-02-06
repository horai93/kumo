import { select } from '@inquirer/prompts'
import { define } from 'gunshi'
import { spawnSync } from 'node:child_process'

const RESOURCES = [
  { name: 'Project', value: 'gcp:project' },
  { name: 'BigQuery', value: 'gcp:bq' },
  { name: 'Cloud Storage', value: 'gcp:gcs' },
  { name: 'Cloud Run', value: 'gcp:run' },
] as const

export const gcpHubCommand = define({
  name: 'gcp',
  description: 'Select GCP resource type and run the corresponding command',
  run: async () => {
    const subcommand = await select({
      message: 'Select a resource:',
      choices: [...RESOURCES],
    })

    const result = spawnSync(process.argv[0]!, [subcommand], {
      stdio: 'inherit',
    })

    if (result.status !== 0) {
      process.exit(result.status ?? 1)
    }
  },
})
