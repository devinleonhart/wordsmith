import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js'
import { WordsmithError } from '../../classes/wordsmithError'
import { getActiveCharacter, setStar } from '../../database/characterRepository'

const GOLD = 0xF1C40F

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star')
    .setDescription("Grant a star to a user's active character.")
    .addUserOption(opt =>
      opt
        .setName('user')
        .setDescription('The user whose active character receives the star.')
        .setRequired(true)
    ),

  async execute (interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('user', true)
    const char = getActiveCharacter(target.id)

    if (!char) {
      throw new WordsmithError(`**${target.displayName}** has no active character.`)
    }

    if (char.star) {
      await interaction.reply({
        content: `**${char.name}** already has a star.`,
        flags: MessageFlags.Ephemeral
      })
      return
    }

    setStar(char.id, true)

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(GOLD)
          .setTitle('★ Star Granted')
          .setDescription(`**${char.name}** has been granted a star.`)
      ]
    })
  }
}
