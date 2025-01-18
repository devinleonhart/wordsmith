import { type Client, Events, type Interaction } from 'discord.js'
import { WordsmithError } from '../../classes/wordsmithError'

module.exports = {
  name: Events.InteractionCreate,
  async execute (interaction: Interaction, client: Client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName)
      if (!command) return
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
        ephemeral: true
      })
    }
    // Do nothing with any other error type. We do not wish to return unknown errors to the client.
  }
}
