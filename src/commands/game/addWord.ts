import { SlashCommandBuilder } from '@discordjs/builders'
import { type CommandInteraction } from 'discord.js'
import { addWord } from '../../mongo/helpers'

const commandName = 'add-word'

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Add a word to a character.')
    .addStringOption((option) =>
      option
        .setName('word')
        .setDescription("The word you'd like to add.")
        .setRequired(true)
    ),
  async execute (interaction: CommandInteraction) {
    const sco: SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
      options: {
        word: interaction.options.get('word')?.value as string
      }
    }

    await addWord(sco)
    await interaction.reply(`${sco.options?.word} added!`)
  }
}
