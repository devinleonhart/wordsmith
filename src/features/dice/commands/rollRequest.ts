import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'

import { rollRequest } from '../rules'

export default {
  data: new SlashCommandBuilder()
    .setName('rr')
    .setDescription('Request that a character roll dice.')
    .addStringOption((option) =>
      option.setName('character-name').setDescription('The name of the character that must roll dice.').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('player-dice').setDescription('The number of player dice to roll.').setRequired(true)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const cname = interaction.options.getString('character-name') ?? ''
    const pdice = interaction.options.getInteger('player-dice') ?? 0

    await interaction.reply(rollRequest(cname, pdice))
  }
}
