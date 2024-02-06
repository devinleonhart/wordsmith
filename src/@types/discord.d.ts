import { type Collection } from 'discord.js'

declare module 'discord.js' {
  export interface Client {
    commands: Collection<unknown, any>
    selectMenus: Collection<unknown, any>
    handleCommands: () => Promise<void>
    handleComponents: () => Promise<void>
    handleEvents: () => Promise<void>
  }
}
