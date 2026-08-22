import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'

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
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const name = interaction.member?.user.username ?? ''
    const targetNumber = interaction.options.getInteger('target-number') ?? 0

    await interaction.reply(RollD20(name, targetNumber))
  }
}
