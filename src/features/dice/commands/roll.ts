import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { type BotCommand } from '../../../core/command'

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
        .setMinValue(1)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const name = interaction.member?.user.username ?? ''
    const pdice = interaction.options.getInteger('player-dice', true)

    await interaction.reply(roll(name, pdice))
  }
} satisfies BotCommand
