import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'
import { moveClient } from '../pokemon-client'

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatMoveName(name: string): string {
  return name.split('-').map(capitalize).join(' ')
}

const commandName = 'move'

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Look up a Pokémon move.')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The move name (e.g. "earthquake" or "ice-beam").')
        .setRequired(true)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const rawName = interaction.options.getString('name')

    if (!rawName) {
      await interaction.reply('Please provide a move name.')
      return
    }

    // Normalize: lowercase, collapse spaces to hyphens so "ice beam" → "ice-beam"
    const moveName = rawName.trim().toLowerCase().replace(/\s+/g, '-')

    try {
      await interaction.deferReply()

      const move = await moveClient.getMoveByName(moveName)

      const displayName = formatMoveName(move.name)
      const type = capitalize(move.type.name)
      const damageClass = move.damage_class ? capitalize(move.damage_class.name) : null

      const headerParts = [type, damageClass].filter(Boolean)
      const header = `**${displayName}** — ${headerParts.join(' · ')}`

      const powerStr = move.power ? `Power: ${move.power}` : null
      const accuracyStr = move.accuracy !== null ? `Accuracy: ${move.accuracy}%` : 'Always hits'
      const ppStr = move.pp !== null ? `PP: ${move.pp}` : null
      const priorityStr = move.priority !== 0 ? `Priority: ${move.priority > 0 ? '+' : ''}${move.priority}` : null

      const statsLine = [powerStr, accuracyStr, ppStr, priorityStr].filter(Boolean).join('  ·  ')

      const effectEntry = move.effect_entries.find(e => e.language.name === 'en')
      let effect = effectEntry?.short_effect ?? ''
      if (effect && move.effect_chance !== null) {
        effect = effect.replace(/\$effect_chance/g, String(move.effect_chance))
      }

      const lines = [header, statsLine, ...(effect ? ['', effect] : [])]

      await interaction.editReply(lines.join('\n'))
    } catch {
      await interaction.editReply(`Could not find a move named "${rawName}". Please check the spelling and try again.`)
    }
  }
}
