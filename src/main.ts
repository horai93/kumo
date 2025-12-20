import { cli } from 'gunshi'
import {
  configGetAccountCommand,
  configSetAccountCommand,
  defaultCommand,
  listCommand,
  openCommand,
} from './commands/index.ts'

await cli(process.argv.slice(2), defaultCommand, {
  name: 'kumo',
  version: '0.1.0',
  description: 'Cloudflare Workers TUI manager',
  subCommands: {
    'config:get-account': configGetAccountCommand,
    'config:set-account': configSetAccountCommand,
    list: listCommand,
    open: openCommand,
  },
})
