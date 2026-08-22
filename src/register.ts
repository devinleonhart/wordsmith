import { REST, Routes } from 'discord.js'
import settings from './core/settings'
import { commands } from './registry'

/**
 * Publishes the slash-command definitions to the target guild. Separated from
 * runtime (bootstrap) so it can be run on its own — `pnpm register` — whenever
 * command definitions change, instead of being an implicit boot side effect.
 */
export async function registerCommands (): Promise<void> {
  const body = commands.map(command => command.data.toJSON())
  const rest = new REST().setToken(settings.secretKey)

  console.log(`Started refreshing ${body.length} application (/) commands.`)
  const data = await rest.put(
    Routes.applicationGuildCommands(settings.clientID, settings.guildID),
    { body }
  ) as unknown[]
  console.log(`Successfully reloaded ${data.length} application (/) commands.`)
}

// Allow running as a standalone script: `pnpm register`.
if (require.main === module) {
  const { assertConfig } = require('./core/settings') as typeof import('./core/settings')
  assertConfig()
  registerCommands().catch((error: unknown) => {
    console.error('Failed to register commands:', error)
    process.exit(1)
  })
}
