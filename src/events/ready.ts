import { type Client, Events } from 'discord.js'
import { type BotEvent } from '../core/command'

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  execute (...args) {
    const [client] = args as [Client]
    console.log(`Ready! Logged in as ${client.user?.tag}!`)
  }
}

export default event
