import { search } from '@inquirer/prompts'
import { define } from 'gunshi'
import { getGcpToken } from '../../gcp/auth/index.ts'
import { GcpClient, getProjects, type Project } from '../../gcp/api/index.ts'
import { createSpinner, copyToClipboard, fuzzyMatch } from '../../ui/index.ts'

export const gcpProjectCommand = define({
  name: 'gcp:project',
  description: 'Select GCP project and copy ID to clipboard (or open in browser with -w)',
  args: {
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
            ? projects.filter((p) => fuzzyMatch(p.projectId, input) || fuzzyMatch(p.name, input))
            : projects
          return filtered.map((p) => ({
            name: p.projectId,
            value: p,
          }))
        },
      })

      if (ctx.values.web) {
        const url = `https://console.cloud.google.com/home/dashboard?project=${selectedProject.projectId}`
        console.log(`\nOpening ${selectedProject.projectId}...`)
        await openUrl(url)
        console.log(`  ${url}\n`)
      } else {
        await copyToClipboard(selectedProject.projectId)
        console.log(`\nCopied: ${selectedProject.projectId}\n`)
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
