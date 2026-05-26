import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js'
import { WordsmithError } from '../../classes/wordsmithError'
import { getActiveCharacter, setStar } from '../../database/characterRepository'

const BLURPLE = 0x5865F2

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unstar')
    .setDescription("Spend a star from a user's active character.")
    .addUserOption(opt =>
      opt
        .setName('user')
        .setDescription("The user whose active character's star is spent.")
        .setRequired(true)
    ),

  async execute (interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('user', true)
    const char = getActiveCharacter(target.id)

    if (!char) {
      throw new WordsmithError(`**${target.displayName}** has no active character.`)
    }

    if (!char.star) {
      await interaction.reply({
        content: `**${char.name}** has no star to spend.`,
        flags: MessageFlags.Ephemeral
      })
      return
    }

    setStar(char.id, false)

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(BLURPLE)
          .setTitle('Star Spent')
          .setDescription(`**${char.name}**'s star has been spent.`)
      ]
    })
  }
}
