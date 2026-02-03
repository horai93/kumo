import { search, select } from '@inquirer/prompts'
import { define } from 'gunshi'
import { getGcpToken } from '../../gcp/auth/index.ts'
import {
  GcpClient,
  getProjects,
  getJobs,
  getCloudRunJobConsoleUrl,
  parseJobName,
  CLOUD_RUN_REGIONS,
  type Project,
  type Job,
} from '../../gcp/api/index.ts'
import { createSpinner, copyToClipboard, fuzzyMatch } from '../../ui/index.ts'

export const gcpRunCommand = define({
  name: 'gcp:run',
  description: 'Select Cloud Run Job and copy name to clipboard (or open in browser with -w)',
  args: {
    project: {
      type: 'string',
      short: 'p',
      description: 'GCP project ID (shows project selector if not specified)',
    },
    region: {
      type: 'string',
      short: 'r',
      description: 'Cloud Run region (shows region selector if not specified)',
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

      spinner.stop()

      let region = ctx.values.region
      if (!region) {
        region = await select({
          message: 'Select a region:',
          choices: CLOUD_RUN_REGIONS.map((r) => ({ name: r, value: r })),
        })
      }

      spinner.start()
      const jobs = await getJobs(client, projectId, region)
      spinner.stop()

      if (jobs.length === 0) {
        console.log('No jobs found')
        return
      }

      const selectedJob = await search<Job>({
        message: 'Select a job:',
        source: async (input) => {
          const filtered = input
            ? jobs.filter((j) => fuzzyMatch(parseJobName(j.name).job, input))
            : jobs
          return filtered.map((j) => ({
            name: parseJobName(j.name).job,
            value: j,
          }))
        },
      })

      const { job: jobName } = parseJobName(selectedJob.name)

      if (ctx.values.web) {
        const url = getCloudRunJobConsoleUrl(projectId, region, jobName)
        console.log(`\nOpening ${jobName}...`)
        await openUrl(url)
        console.log(`  ${url}\n`)
      } else {
        await copyToClipboard(jobName)
        console.log(`\nCopied: ${jobName}\n`)
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
