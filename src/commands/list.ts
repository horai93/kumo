import { define } from 'gunshi'
import { getValidToken } from '../auth/index.ts'
import { CloudflareClient, getAccounts, getWorkers } from '../api/index.ts'
import { getDefaultAccountId } from '../config/index.ts'
import { createSpinner } from '../ui/index.ts'

export const listCommand = define({
  name: 'list',
  description: 'List all Workers',
  args: {
    account: {
      type: 'string',
      short: 'a',
      description: 'Account ID (uses default if not specified)',
    },
    json: {
      type: 'boolean',
      short: 'j',
      description: 'Output as JSON',
    },
  },
  run: async (ctx) => {
    const spinner = createSpinner('Loading workers...')
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

      const workers = await getWorkers(client, accountId)
      spinner.stop()

      if (ctx.values.json) {
        console.log(JSON.stringify(workers, null, 2))
        return
      }

      if (workers.length === 0) {
        console.log('No workers found')
        return
      }

      console.log(`\nWorkers (${workers.length}):\n`)
      for (const worker of workers) {
        const date = new Date(worker.modified_on)
        const modified = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
        console.log(`  ${worker.id}  (modified: ${modified})`)
      }
      console.log()
    } catch (error) {
      spinner.stop()
      throw error
    }
  },
})
