import { search } from '@inquirer/prompts'
import { define } from 'gunshi'
import { getGcpToken } from '../../gcp/auth/index.ts'
import {
  GcpClient,
  getDatasets,
  getTables,
  getBqConsoleUrl,
  getProjects,
  type Dataset,
  type Table,
  type Project,
} from '../../gcp/api/index.ts'
import { createSpinner, copyToClipboard, fuzzyMatch } from '../../ui/index.ts'

export const gcpBqCommand = define({
  name: 'gcp:bq',
  description: 'Select BigQuery table and copy ID to clipboard (or open in browser with -w)',
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

      const datasets = await getDatasets(client, projectId)
      spinner.stop()

      if (datasets.length === 0) {
        console.log('No datasets found')
        return
      }

      const selectedDataset = await search<Dataset>({
        message: 'Select a dataset:',
        source: async (input) => {
          const filtered = input
            ? datasets.filter((d) => fuzzyMatch(d.datasetReference.datasetId, input))
            : datasets
          return filtered.map((d) => ({
            name: d.friendlyName
              ? `${d.datasetReference.datasetId} (${d.friendlyName})`
              : d.datasetReference.datasetId,
            value: d,
          }))
        },
      })

      const tablesSpinner = createSpinner('Loading tables...')
      tablesSpinner.start()
      const tables = await getTables(client, projectId, selectedDataset.datasetReference.datasetId)
      tablesSpinner.stop()

      const datasetId = selectedDataset.datasetReference.datasetId

      if (tables.length === 0) {
        if (ctx.values.web) {
          const url = getBqConsoleUrl(projectId, datasetId)
          console.log(`\nNo tables found. Opening dataset...`)
          await openUrl(url)
          console.log(`  ${url}\n`)
        } else {
          const id = `${projectId}.${datasetId}`
          await copyToClipboard(id)
          console.log(`\nCopied: ${id}\n`)
        }
        return
      }

      const selectedTable = await search<Table>({
        message: 'Select a table:',
        source: async (input) => {
          const filtered = input
            ? tables.filter((t) => fuzzyMatch(t.tableReference.tableId, input))
            : tables
          return filtered.map((t) => ({
            name: t.friendlyName
              ? `${t.tableReference.tableId} (${t.friendlyName}) [${t.type}]`
              : `${t.tableReference.tableId} [${t.type}]`,
            value: t,
          }))
        },
      })

      const tableId = selectedTable.tableReference.tableId

      if (ctx.values.web) {
        const url = getBqConsoleUrl(projectId, datasetId, tableId)
        console.log(`\nOpening ${tableId}...`)
        await openUrl(url)
        console.log(`  ${url}\n`)
      } else {
        const id = `${projectId}.${datasetId}.${tableId}`
        await copyToClipboard(id)
        console.log(`\nCopied: ${id}\n`)
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
