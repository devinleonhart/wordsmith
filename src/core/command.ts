import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type Client,
  type ClientEvents
} from 'discord.js'

/** A slash command: its builder data plus the handlers that run it. */
export interface BotCommand {
  data: { name: string; toJSON: () => unknown }
  execute: (interaction: ChatInputCommandInteraction, client: Client) => Promise<void>
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>
}

/** A gateway event listener. `execute` receives the event args plus the client. */
export interface BotEvent {
  name: keyof ClientEvents
  once?: boolean
  execute: (...args: unknown[]) => void | Promise<void>
}
