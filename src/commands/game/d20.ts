import { SlashCommandBuilder } from '@discordjs/builders'
import { type CommandInteraction } from 'discord.js'

import { RollD20 } from '../../rules'

const commandName = 'd20'

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Make a d20 roll in wordsmith.')
    .addIntegerOption((option) =>
      option
        .setName('target-number')
        .setDescription('The number you need to roll to pass the challenge.')
        .setRequired(true)
    ),
  async execute (interaction: CommandInteraction) {
    let name = ''
    if (interaction.member) {
      name = interaction.member.user.username
    }

    let targetNumber = 0
    const tNumberOption = interaction.options.get('target-number')
    if (tNumberOption) {
      targetNumber = tNumberOption.value as number
    }

    const result = RollD20(name, targetNumber)
    await interaction.reply(result)
  }
}
