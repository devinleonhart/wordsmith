import { SlashCommandBuilder } from '@discordjs/builders'
import { type CommandInteraction } from 'discord.js'
import { removeCharacter } from '../../mongo/helpers'

const commandName = 'remove-character'

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Remove your character from this wordsmith channel.'),
  async execute (interaction: CommandInteraction) {
    const sco: SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId
    }

    await removeCharacter(sco)
    await interaction.reply('Character deleted!')
  }
}
