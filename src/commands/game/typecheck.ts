import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'
import { calculateTypeEffectiveness, getEffectivenessDescription, getValidTypes } from '../../utils/pokemon-types'

const commandName = 'typecheck'

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Check type effectiveness of an attack against a Pokémon.')
    .addStringOption((option) =>
      option
        .setName('attack_type')
        .setDescription('The type of the attacking move.')
        .setRequired(true)
        .addChoices(
          ...getValidTypes().map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: type
          }))
        )
    )
    .addStringOption((option) =>
      option
        .setName('defender_type1')
        .setDescription('The primary type of the defending Pokémon.')
        .setRequired(true)
        .addChoices(
          ...getValidTypes().map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: type
          }))
        )
    )
    .addStringOption((option) =>
      option
        .setName('defender_type2')
        .setDescription('The secondary type of the defending Pokémon (optional).')
        .setRequired(false)
        .addChoices(
          ...getValidTypes().map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: type
          }))
        )
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const attackType = interaction.options.getString('attack_type')
    const defenderType1 = interaction.options.getString('defender_type1')
    const defenderType2 = interaction.options.getString('defender_type2')

    if (!attackType || !defenderType1) {
      await interaction.reply('Please provide at least an attack type and one defender type.')
      return
    }

    const defenderTypes = defenderType2 ? [defenderType1, defenderType2] : [defenderType1]

    try {
      const multiplier = calculateTypeEffectiveness(attackType, defenderTypes)
      const description = getEffectivenessDescription(multiplier)

      const defenderTypeString = defenderTypes
        .map(type => type.charAt(0).toUpperCase() + type.slice(1))
        .join('/')

      const attackTypeString = attackType.charAt(0).toUpperCase() + attackType.slice(1)

      await interaction.reply(
        `**${attackTypeString}** vs **${defenderTypeString}**\n${description}`
      )
    } catch {
      await interaction.reply('An error occurred while calculating type effectiveness.')
    }
  }
}
