import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { type BotCommand } from '../../../core/command'

import { rollOpposed } from '../rules'

export default {
  data: new SlashCommandBuilder()
    .setName('ro')
    .setDescription('Make an opposed roll in wordsmith.')
    .addIntegerOption((option) =>
      option.setName('player-dice').setDescription('The number of player dice to roll.').setRequired(true).setMinValue(1)
    )
    .addIntegerOption((option) =>
      option.setName('challenge-dice').setDescription('The number of challenge dice to roll.').setRequired(true).setMinValue(1)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const name = interaction.member?.user.username ?? ''
    const pdice = interaction.options.getInteger('player-dice', true)
    const cdice = interaction.options.getInteger('challenge-dice', true)

    await interaction.reply(rollOpposed(name, pdice, cdice))
  }
} satisfies BotCommand
