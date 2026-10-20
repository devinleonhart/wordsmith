import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { type BotCommand } from '../../../core/command'

import { rollOpposedRequest } from '../rules'

export default {
  data: new SlashCommandBuilder()
    .setName('ror')
    .setDescription('Request that a character make an opposed roll.')
    .addStringOption(option =>
      option.setName('character-name').setDescription('The name of the character that must roll dice.').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('player-dice').setDescription('The number of player dice to roll.').setRequired(true).setMinValue(1)
    )
    .addIntegerOption(option =>
      option.setName('challenge-dice').setDescription('The number of challenge dice to roll.').setRequired(true).setMinValue(1)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const cname = interaction.options.getString('character-name', true)
    const pdice = interaction.options.getInteger('player-dice', true)
    const cdice = interaction.options.getInteger('challenge-dice', true)

    await interaction.reply(rollOpposedRequest(cname, pdice, cdice))
  }
} satisfies BotCommand
