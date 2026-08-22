import { Client, Collection, GatewayIntentBits } from 'discord.js'
import settings, { assertConfig } from './core/settings'
import { closeDb, initDb } from './core/db'
import { commands, events } from './registry'
import { registerCommands } from './register'

export async function bootstrap (): Promise<Client> {
  assertConfig()
  initDb()

  const client = new Client({
    intents: [GatewayIntentBits.Guilds] // Our bot would like to interact with servers.
  })

  client.commands = new Collection()
  for (const command of commands) {
    client.commands.set(command.data.name, command)
  }

  for (const event of events) {
    const listener = (...args: unknown[]): void => {
      void Promise.resolve(event.execute(...args, client))
        .catch(error => { console.error(`Error in event ${event.name}:`, error) })
    }
    if (event.once) client.once(event.name, listener)
    else client.on(event.name, listener)
  }

  // Keep the guild's slash commands in sync on boot (idempotent), but never let
  // a transient Discord error or registration rate-limit block the bot from
  // coming up. Run `pnpm register` to force a sync if one is ever skipped here.
  try {
    await registerCommands()
  } catch (error) {
    console.error('Command registration failed on boot (continuing to login):', error)
  }
  await client.login(settings.secretKey)

  registerShutdown(client)
  return client
}

function registerShutdown (client: Client): void {
  const shutdown = (signal: string): void => {
    console.log(`Received ${signal}, shutting down…`)
    void client.destroy()
      .catch(error => { console.error('Error destroying client:', error) })
      .finally(() => {
        closeDb()
        process.exit(0)
      })
  }
  process.once('SIGTERM', () => { shutdown('SIGTERM') })
  process.once('SIGINT', () => { shutdown('SIGINT') })
}
