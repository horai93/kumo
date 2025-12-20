import { cli } from 'gunshi'
import { ExitPromptError } from '@inquirer/core'
import {
  configGetAccountCommand,
  configSetAccountCommand,
  defaultCommand,
  listCommand,
  openCommand,
} from './commands/index.ts'
import { checkForUpdate, getCurrentVersion } from './version.ts'

const version = getCurrentVersion()

try {
  await cli(process.argv.slice(2), defaultCommand, {
    name: 'kumo',
    version,
    description: 'Cloudflare Workers TUI manager',
    subCommands: {
      'config:get-account': configGetAccountCommand,
      'config:set-account': configSetAccountCommand,
      list: listCommand,
      open: openCommand,
    },
  })

  // Check for updates after command execution (non-blocking)
  const latestVersion = await checkForUpdate()
  if (latestVersion) {
    console.log(`\nUpdate available: v${version} → v${latestVersion}`)
    console.log('  https://github.com/horai93/kumo/releases/latest\n')
  }
} catch (error) {
  if (error instanceof ExitPromptError) {
    // User pressed Ctrl+C, exit silently
    process.exit(0)
  }
  throw error
}
