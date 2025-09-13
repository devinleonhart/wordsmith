import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'
import { PokemonClient } from 'pokenode-ts'

const commandName = 'pokemon'

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Get the types of a Pokémon by name.')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name of the Pokémon to look up.')
        .setRequired(true)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const pokemonName = interaction.options.getString('name')

    if (!pokemonName) {
      await interaction.reply('Please provide a Pokémon name.')
      return
    }

    try {
      await interaction.deferReply()

      const pokemonClient = new PokemonClient()
      const pokemon = await pokemonClient.getPokemonByName(pokemonName.toLowerCase())
      const types = pokemon.types
        .map((typeInfo: any) => typeInfo.type.name)
        .join(', ')

      await interaction.editReply(`**${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}** is a ${types} type Pokémon.`)
    } catch {
      await interaction.editReply(`Could not find a Pokémon named "${pokemonName}". Please check the spelling and try again.`)
    }
  }
}
