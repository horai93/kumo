import { search } from '@inquirer/prompts'
import { define } from 'gunshi'
import { getGcpToken } from '../../gcp/auth/index.ts'
import {
  GcpClient,
  getProjects,
  getSecrets,
  getSecretConsoleUrl,
  parseSecretName,
  type Project,
  type SecretResource,
} from '../../gcp/api/index.ts'
import { createSpinner, copyToClipboard, fuzzyMatch } from '../../ui/index.ts'

export const gcpSecretCommand = define({
  name: 'gcp:secret',
  description:
    'Select Secret Manager secret and copy name to clipboard (or open in browser with -w)',
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
              ? projects.filter((p) => fuzzyMatch(p.projectId, input) || fuzzyMatch(p.name, input))
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

      const secrets = await getSecrets(client, projectId)
      spinner.stop()

      if (secrets.length === 0) {
        console.log('No secrets found')
        return
      }

      const selectedSecret = await search<SecretResource>({
        message: 'Select a secret:',
        source: async (input) => {
          const filtered = input
            ? secrets.filter((s) => fuzzyMatch(parseSecretName(s.name).secret, input))
            : secrets
          return filtered.map((s) => ({
            name: parseSecretName(s.name).secret,
            value: s,
          }))
        },
      })

      const { secret: secretName } = parseSecretName(selectedSecret.name)

      if (ctx.values.web) {
        const url = getSecretConsoleUrl(projectId, secretName)
        console.log(`\nOpening ${secretName}...`)
        await openUrl(url)
        console.log(`  ${url}\n`)
      } else {
        await copyToClipboard(secretName)
        console.log(`\nCopied: ${secretName}\n`)
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
