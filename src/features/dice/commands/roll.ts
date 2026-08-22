import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'

import { roll } from '../rules'

export default {
  data: new SlashCommandBuilder()
    .setName('r')
    .setDescription('Make a roll in wordsmith.')
    .addIntegerOption((option) =>
      option
        .setName('player-dice')
        .setDescription('The number of player dice being rolled.')
        .setRequired(true)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const name = interaction.member?.user.username ?? ''
    const pdice = interaction.options.getInteger('player-dice') ?? 0

    await interaction.reply(roll(name, pdice))
  }
}
