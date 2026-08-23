import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'

import { resolveChallenge } from '../engine'
import { formatResult } from '../format'

export default {
  data: new SlashCommandBuilder()
    .setName('ro')
    .setDescription('Roll player dice against challenge dice (manual, no adjudication).')
    .addIntegerOption((option) =>
      option
        .setName('player-dice')
        .setDescription('The number of player dice to roll.')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addIntegerOption((option) =>
      option
        .setName('challenge-dice')
        .setDescription('The number of challenge dice to roll.')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const name = interaction.member?.user.username ?? 'Player'
    const playerDice = interaction.options.getInteger('player-dice') ?? 0
    const challengeDice = interaction.options.getInteger('challenge-dice') ?? 0

    const result = resolveChallenge(playerDice, challengeDice)
    await interaction.reply(formatResult(result, { title: `**${name}**'s roll` }))
  }
}
