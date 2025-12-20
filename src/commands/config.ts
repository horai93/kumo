import { select } from '@inquirer/prompts'
import { define } from 'gunshi'
import { getValidToken } from '../auth/index.ts'
import { CloudflareClient, getAccounts } from '../api/index.ts'
import type { Account } from '../api/types.ts'
import { getDefaultAccountId, setDefaultAccountId } from '../config/index.ts'
import { createSpinner } from '../ui/index.ts'

export const configGetAccountCommand = define({
  name: 'config:get-account',
  description: 'Show the default account',
  run: async () => {
    const accountId = await getDefaultAccountId()
    if (accountId) {
      console.log(`Default account: ${accountId}`)
    } else {
      console.log('No default account set. Run "kumo config:set-account" to set one.')
    }
  },
})

export const configSetAccountCommand = define({
  name: 'config:set-account',
  description: 'Set the default account',
  args: {
    accountId: {
      type: 'positional',
      description: 'Account ID to set as default (interactive if not specified)',
    },
  },
  run: async (ctx) => {
    const accountIdArg = ctx.values.accountId as string | undefined

    if (accountIdArg) {
      await setDefaultAccountId(accountIdArg)
      console.log(`Default account set to: ${accountIdArg}`)
      return
    }

    // Interactive mode - let user select from available accounts
    const spinner = createSpinner('Loading accounts...')
    spinner.start()

    try {
      const token = await getValidToken()
      const client = new CloudflareClient(token)
      const accounts = await getAccounts(client)
      spinner.stop()

      if (accounts.length === 0) {
        console.log('No accounts found')
        return
      }

      const selectedAccount = await select<Account>({
        message: 'Select default account:',
        choices: accounts.map((acc) => ({
          name: `${acc.name} (${acc.id})`,
          value: acc,
        })),
      })

      await setDefaultAccountId(selectedAccount.id)
      console.log(`\nDefault account set to: ${selectedAccount.name} (${selectedAccount.id})`)
    } catch (error) {
      spinner.stop()
      throw error
    }
  },
})
