import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { type BotCommand } from '../../../core/command'

import { RollD20 } from '../rules'

export default {
  data: new SlashCommandBuilder()
    .setName('d20')
    .setDescription('Make a d20 roll in wordsmith.')
    .addIntegerOption((option) =>
      option
        .setName('target-number')
        .setDescription('The number you need to roll to pass the challenge.')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const name = interaction.member?.user.username ?? ''
    const targetNumber = interaction.options.getInteger('target-number', true)

    await interaction.reply(RollD20(name, targetNumber))
  }
} satisfies BotCommand
