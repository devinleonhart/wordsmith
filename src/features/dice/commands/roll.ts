import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'

import { rollPlayerPool } from '../engine'
import { formatPlayerPool } from '../format'

export default {
  data: new SlashCommandBuilder()
    .setName('r')
    .setDescription('Roll a raw pool of wordsmith player dice.')
    .addIntegerOption((option) =>
      option
        .setName('player-dice')
        .setDescription('The number of player dice to roll.')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const name = interaction.member?.user.username ?? 'Player'
    const dice = interaction.options.getInteger('player-dice') ?? 0

    await interaction.reply(formatPlayerPool(name, rollPlayerPool(dice)))
  }
}
