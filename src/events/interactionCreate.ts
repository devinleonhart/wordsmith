import {
  type ChatInputCommandInteraction,
  type Client,
  Events,
  type Interaction,
  MessageFlags
} from 'discord.js'
import { type BotCommand, type BotEvent } from '../core/command'
import { WordsmithError } from '../core/errors'
import { handleComponent, isAttemptComponent } from '../features/challenge/attempt'

const GENERIC_ERROR = 'Something went wrong while running that command. Please try again.'

const event: BotEvent = {
  name: Events.InteractionCreate,
  async execute (...args) {
    const [interaction, client] = args as [Interaction, Client]
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName)
      if (command?.autocomplete) await command.autocomplete(interaction)
      return
    }

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName)
      if (!command) return
      await handleExecute(command, interaction, client)
      return
    }

    if (interaction.isMessageComponent() && isAttemptComponent(interaction.customId)) {
      try {
        await handleComponent(interaction)
      } catch (error) {
        console.error('Error handling attempt component:', error)
      }
    }
  }
}

export default event

async function handleExecute (
  command: BotCommand,
  interaction: ChatInputCommandInteraction,
  client: Client
): Promise<void> {
  try {
    await command.execute(interaction, client)
  } catch (error) {
    const known = error instanceof WordsmithError
    if (!known) {
      console.error(`Unhandled error in /${interaction.commandName}:`, error)
    }
    await respondWithError(interaction, known ? error.message : GENERIC_ERROR)
  }
}

// Surface the error without assuming the command hasn't already replied or
// deferred — reply() throws InteractionAlreadyReplied in those cases, so pick
// followUp instead. Never let the error response itself crash the handler.
async function respondWithError (
  interaction: ChatInputCommandInteraction,
  content: string
): Promise<void> {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, flags: MessageFlags.Ephemeral })
    } else {
      await interaction.reply({ content, flags: MessageFlags.Ephemeral })
    }
  } catch (err) {
    console.error(`Failed to send error response for /${interaction.commandName}:`, err)
  }
}
