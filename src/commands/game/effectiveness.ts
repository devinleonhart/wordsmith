import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'
import { PokemonClient } from 'pokenode-ts'
import { calculateTypeEffectiveness, getEffectivenessDescription, getValidTypes } from '../../utils/pokemon-types'

const commandName = 'effectiveness'

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Check how effective an attack type is against a specific Pokémon.')
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
        .setName('pokemon')
        .setDescription('The name of the Pokémon to check against.')
        .setRequired(true)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const attackType = interaction.options.getString('attack_type')
    const pokemonName = interaction.options.getString('pokemon')

    if (!attackType || !pokemonName) {
      await interaction.reply('Please provide both an attack type and a Pokémon name.')
      return
    }

    try {
      await interaction.deferReply()

      const pokemonClient = new PokemonClient()
      const pokemon = await pokemonClient.getPokemonByName(pokemonName.toLowerCase())

      // Extract the Pokémon's types
      const pokemonTypes = pokemon.types
        .map((typeInfo: any) => typeInfo.type.name)

      // Calculate effectiveness
      const multiplier = calculateTypeEffectiveness(attackType, pokemonTypes)
      const description = getEffectivenessDescription(multiplier)

      // Format the response
      const pokemonDisplayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
      const attackTypeDisplay = attackType.charAt(0).toUpperCase() + attackType.slice(1)
      const typesDisplay = pokemonTypes
        .map(type => type.charAt(0).toUpperCase() + type.slice(1))
        .join('/')

      await interaction.editReply(
        `**${attackTypeDisplay}** vs **${pokemonDisplayName}** (${typesDisplay})\n${description}`
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        await interaction.editReply(`Could not find a Pokémon named "${pokemonName}". Please check the spelling and try again.`)
      } else {
        await interaction.editReply('An error occurred while looking up the Pokémon or calculating effectiveness.')
      }
    }
  }
}
