import { select } from '@inquirer/prompts'
import { define } from 'gunshi'
import { getValidToken } from '../auth/index.ts'
import { CloudflareClient, getAccounts, getWorkerDashboardUrl, getWorkers } from '../api/index.ts'
import { getDefaultAccountId } from '../config/index.ts'
import { createSpinner, selectWorker } from '../ui/index.ts'
import type { Account } from '../api/types.ts'

export const defaultCommand = define({
  name: 'kumo',
  description: 'Open Cloudflare Worker in browser',
  args: {
    account: {
      type: 'string',
      short: 'a',
      description: 'Account ID (uses default if not specified)',
    },
  },
  run: async (ctx) => {
    const spinner = createSpinner('Loading...')
    spinner.start()

    try {
      const token = await getValidToken()
      const client = new CloudflareClient(token)

      const accounts = await getAccounts(client)
      if (accounts.length === 0) {
        spinner.stop('No accounts found')
        return
      }

      // Priority: CLI arg > config default > interactive selection > first account
      let accountId = ctx.values.account

      if (!accountId) {
        const defaultId = await getDefaultAccountId()
        if (defaultId && accounts.some((a) => a.id === defaultId)) {
          accountId = defaultId
        }
      }

      // If still no account and multiple accounts, let user choose
      if (!accountId && accounts.length > 1) {
        spinner.stop()
        const selectedAccount = await select<Account>({
          message: 'Select an account:',
          choices: accounts.map((acc) => ({
            name: `${acc.name} (${acc.id})`,
            value: acc,
          })),
        })
        accountId = selectedAccount.id
        spinner.start()
      } else if (!accountId) {
        accountId = accounts[0]?.id
      }

      if (!accountId) {
        spinner.stop('No account ID available')
        return
      }

      const workers = await getWorkers(client, accountId)
      spinner.stop()

      if (workers.length === 0) {
        console.log('No workers found')
        return
      }

      const selectedWorker = await selectWorker(workers)
      const url = getWorkerDashboardUrl(accountId, selectedWorker.id)

      console.log(`\nOpening ${selectedWorker.id}...`)

      // Open in browser
      const { spawn } = await import('node:child_process')
      const cmd =
        process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
      spawn(cmd, [url], { detached: true, stdio: 'ignore' }).unref()

      console.log(`  ${url}\n`)
    } catch (error) {
      spinner.stop()
      throw error
    }
  },
})

export { configGetAccountCommand, configSetAccountCommand } from './config.ts'
export { listCommand } from './list.ts'
export { openCommand } from './open.ts'
