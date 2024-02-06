import { SlashCommandBuilder } from '@discordjs/builders'
import { type CommandInteraction } from 'discord.js'
import { addItem } from '../../mongo/helpers'

const commandName = 'add-item'

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Add a item to a character.')
    .addStringOption((option) =>
      option
        .setName('item')
        .setDescription("The item you'd like to add.")
        .setRequired(true)
    ),
  async execute (interaction: CommandInteraction) {
    const sco: SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
      options: {
        item: interaction.options.get('item')?.value as string
      }
    }

    await addItem(sco)
    await interaction.reply(`${sco.options?.item} added!`)
  }
}
