import { type Client, Events, type Interaction, MessageFlags } from 'discord.js'
import { WordsmithError } from '../../classes/wordsmithError'

module.exports = {
  name: Events.InteractionCreate,
  async execute (interaction: Interaction, client: Client) {
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName)
      if (command?.autocomplete) await command.autocomplete(interaction)
      return
    }

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName)
      if (!command) {
        console.error(`No handler found for command: ${interaction.commandName}`)
        return
      }
      await handleExecute(command, interaction, client)
    }
  }
}

async function handleExecute (instance: any, interaction: any, client: any): Promise<void> {
  try {
    await instance.execute(interaction, client)
  } catch (error) {
    if (error instanceof WordsmithError) {
      await interaction.reply({
        content: `${error.message}`,
        flags: MessageFlags.Ephemeral
      })
    } else {
      console.error(`Unhandled error in /${interaction.commandName}:`, error)
    }
  }
}
