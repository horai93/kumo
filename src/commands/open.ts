import { define } from 'gunshi'
import { getValidToken } from '../auth/index.ts'
import { CloudflareClient, getAccounts, getWorkerDashboardUrl, getWorkers } from '../api/index.ts'
import { getDefaultAccountId } from '../config/index.ts'
import { createSpinner } from '../ui/index.ts'

export const openCommand = define({
  name: 'open',
  description: 'Open a Worker in the browser',
  args: {
    name: {
      type: 'positional',
      description: 'Worker name to open',
      required: true,
    },
    account: {
      type: 'string',
      short: 'a',
      description: 'Account ID (uses default if not specified)',
    },
  },
  run: async (ctx) => {
    const workerName = ctx.values.name as string
    const spinner = createSpinner('Loading...')
    spinner.start()

    try {
      const token = await getValidToken()
      const client = new CloudflareClient(token)

      let accountId = ctx.values.account

      if (!accountId) {
        const defaultId = await getDefaultAccountId()
        if (defaultId) {
          accountId = defaultId
        }
      }

      if (!accountId) {
        const accounts = await getAccounts(client)
        if (accounts.length === 0) {
          spinner.stop('No accounts found')
          return
        }
        accountId = accounts[0]?.id
      }

      if (!accountId) {
        spinner.stop('No account ID available')
        return
      }

      // Verify worker exists
      const workers = await getWorkers(client, accountId)
      const worker = workers.find((w) => w.id === workerName)

      if (!worker) {
        spinner.stop(`Worker "${workerName}" not found`)
        return
      }

      const url = getWorkerDashboardUrl(accountId, workerName)
      spinner.stop(`Opening ${workerName}...`)

      // Open in browser
      const { spawn } = await import('node:child_process')
      const cmd =
        process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
      spawn(cmd, [url], { detached: true, stdio: 'ignore' }).unref()

      console.log(`\n  ${url}\n`)
    } catch (error) {
      spinner.stop()
      throw error
    }
  },
})
