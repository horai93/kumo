import { search } from '@inquirer/prompts'
import { define } from 'gunshi'
import { getGcpToken } from '../../gcp/auth/index.ts'
import {
  GcpClient,
  getBuckets,
  getGcsConsoleUrl,
  getProjects,
  type Bucket,
  type Project,
} from '../../gcp/api/index.ts'
import { createSpinner, copyToClipboard, fuzzyMatch } from '../../ui/index.ts'

export const gcpGcsCommand = define({
  name: 'gcp:gcs',
  description: 'Select GCS bucket and copy URI to clipboard (or open in browser with -w)',
  args: {
    project: {
      type: 'string',
      short: 'p',
      description: 'GCP project ID (shows project selector if not specified)',
    },
    web: {
      type: 'boolean',
      short: 'w',
      description: 'Open in browser instead of copying to clipboard',
    },
  },
  run: async (ctx) => {
    const spinner = createSpinner('Loading...')
    spinner.start()

    try {
      const token = await getGcpToken()
      const client = new GcpClient(token)

      let projectId = ctx.values.project
      if (!projectId) {
        const projects = await getProjects(client)
        spinner.stop()

        if (projects.length === 0) {
          console.log('No projects found')
          return
        }

        const selectedProject = await search<Project>({
          message: 'Select a project:',
          source: async (input) => {
            const filtered = input
              ? projects.filter(
                  (p) => fuzzyMatch(p.projectId, input) || fuzzyMatch(p.name, input)
                )
              : projects
            return filtered.map((p) => ({
              name: p.projectId,
              value: p,
            }))
          },
        })
        projectId = selectedProject.projectId
        spinner.start()
      }

      const buckets = await getBuckets(client, projectId)
      spinner.stop()

      if (buckets.length === 0) {
        console.log('No buckets found')
        return
      }

      const selectedBucket = await search<Bucket>({
        message: 'Select a bucket:',
        source: async (input) => {
          const filtered = input
            ? buckets.filter((b) => fuzzyMatch(b.name, input))
            : buckets
          return filtered.map((b) => ({
            name: `${b.name} (${b.location}, ${b.storageClass})`,
            value: b,
          }))
        },
      })

      if (ctx.values.web) {
        const url = getGcsConsoleUrl(selectedBucket.name)
        console.log(`\nOpening ${selectedBucket.name}...`)
        await openUrl(url)
        console.log(`  ${url}\n`)
      } else {
        const uri = `gs://${selectedBucket.name}`
        await copyToClipboard(uri)
        console.log(`\nCopied: ${uri}\n`)
      }
    } catch (error) {
      spinner.stop()
      throw error
    }
  },
})

async function openUrl(url: string): Promise<void> {
  const { spawn } = await import('node:child_process')
  const cmd =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  spawn(cmd, [url], { detached: true, stdio: 'ignore' }).unref()
}
