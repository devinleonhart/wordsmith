import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'

import { rollOpposed } from '../rules'

export default {
  data: new SlashCommandBuilder()
    .setName('ro')
    .setDescription('Make an opposed roll in wordsmith.')
    .addIntegerOption((option) =>
      option.setName('player-dice').setDescription('The number of player dice to roll.').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('challenge-dice').setDescription('The number of challenge dice to roll.').setRequired(true)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const name = interaction.member?.user.username ?? ''
    const pdice = interaction.options.getInteger('player-dice') ?? 0
    const cdice = interaction.options.getInteger('challenge-dice') ?? 0

    await interaction.reply(rollOpposed(name, pdice, cdice))
  }
}
