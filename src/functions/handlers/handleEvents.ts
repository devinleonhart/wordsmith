import { readdirSync } from 'fs'
import { resolve } from 'path'
import { type Client } from 'discord.js'

module.exports = (client: Client) => {
  client.handleEvents = async () => {
    const eventFolders = readdirSync(resolve(__dirname, '../../events'))
    for (const folder of eventFolders) {
      const eventFiles = readdirSync(
        resolve(__dirname, `../../events/${folder}`)
      )

      switch (folder) {
        case 'client':
          for (const file of eventFiles) {
            const event = require(resolve(
              __dirname,
              `../../events/${folder}/${file}`
            ))
            if (event.once) {
              client.once(event.name, (...args) =>
                event.execute(...args, client)
              )
            } else {
              client.on(event.name, (...args) =>
                event.execute(...args, client)
              )
            }
          }
          break

        default:
          break
      }
    }
  }
}
