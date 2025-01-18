import { readdirSync } from 'fs'
import { resolve } from 'path'
import { Client, Collection, GatewayIntentBits } from 'discord.js'
import settings from './settings';

(async () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds] // Our bot would like to interact with servers.
  })

  client.commands = new Collection()
  client.selectMenus = new Collection()

  const functionFolders = readdirSync(resolve(__dirname, './functions'))
  for (const folder of functionFolders) {
    const functionFiles = readdirSync(
      resolve(__dirname, `./functions/${folder}`)
    )
    for (const file of functionFiles) {
      require(`./functions/${folder}/${file}`)(client)
    }
  }

  await client.handleEvents()
  await client.handleCommands()
  await client.login(settings.secretKey)
})().catch(error => { console.error('Unhandled promise rejection:', error) })
