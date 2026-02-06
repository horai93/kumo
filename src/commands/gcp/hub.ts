import { select } from '@inquirer/prompts'
import { define } from 'gunshi'
import { gcpProjectCommand } from './project.ts'
import { gcpBqCommand } from './bq.ts'
import { gcpGcsCommand } from './gcs.ts'
import { gcpRunCommand } from './run.ts'

const RESOURCES = [
  { name: 'Project', value: 'project' },
  { name: 'BigQuery', value: 'bq' },
  { name: 'Cloud Storage', value: 'gcs' },
  { name: 'Cloud Run', value: 'run' },
] as const

const commands = {
  project: gcpProjectCommand,
  bq: gcpBqCommand,
  gcs: gcpGcsCommand,
  run: gcpRunCommand,
} as const

export const gcpHubCommand = define({
  name: 'gcp',
  description: 'Select GCP resource type and run the corresponding command',
  run: async () => {
    const selected = await select({
      message: 'Select a resource:',
      choices: [...RESOURCES],
    })

    const command = commands[selected]
    // biome-ignore lint: hub invokes subcommands without flags
    await (command as any).run({ values: {} })
  },
})
