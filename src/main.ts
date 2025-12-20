import { cli } from 'gunshi'
import { ExitPromptError } from '@inquirer/core'
import {
  configGetAccountCommand,
  configSetAccountCommand,
  defaultCommand,
  listCommand,
  openCommand,
} from './commands/index.ts'

try {
  await cli(process.argv.slice(2), defaultCommand, {
    name: 'kumo',
    version: '0.2.1',
    description: 'Cloudflare Workers TUI manager',
    subCommands: {
      'config:get-account': configGetAccountCommand,
      'config:set-account': configSetAccountCommand,
      list: listCommand,
      open: openCommand,
    },
  })
} catch (error) {
  if (error instanceof ExitPromptError) {
    // User pressed Ctrl+C, exit silently
    process.exit(0)
  }
  throw error
}
