import { type Collection } from 'discord.js'
import { type BotCommand } from '../core/command'

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, BotCommand>
  }
}
