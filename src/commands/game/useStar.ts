import { SlashCommandBuilder } from '@discordjs/builders'
import { type CommandInteraction } from 'discord.js'
import { useStar } from '../../mongo/helpers'
import { DiscordEmotes } from '../../rules-util'

const commandName = 'use-star'

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Spend a character's star!"),
  async execute (interaction: CommandInteraction) {
    const sco: SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId
    }

    await useStar(sco)
    await interaction.reply(DiscordEmotes.smirkingCatWithBeer)
  }
}
