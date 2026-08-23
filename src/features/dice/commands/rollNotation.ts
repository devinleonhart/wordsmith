import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js'

import { parseDiceExpr, rollDice, formatExpr } from '../notation'

export default {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll dice with standard notation, e.g. 3d6 or 2d20+5.')
    .addStringOption((option) =>
      option
        .setName('dice')
        .setDescription('Dice expression, e.g. "3d6", "1d20+5", "4d8-1".')
        .setRequired(true)
    ),
  async execute (interaction: ChatInputCommandInteraction) {
    const input = interaction.options.getString('dice', true)
    const expr = parseDiceExpr(input)

    if (!expr) {
      await interaction.reply({
        content: `Couldn't read "${input}". Use notation like \`3d6\`, \`1d20+5\`, or \`4d8-1\` (1–100 dice, 2–1000 sides).`,
        flags: MessageFlags.Ephemeral
      })
      return
    }

    const { rolls, total } = rollDice(expr)
    const breakdown = rolls.join(' + ')
    const mod = expr.modifier === 0
      ? ''
      : expr.modifier > 0 ? ` + ${expr.modifier}` : ` - ${Math.abs(expr.modifier)}`

    await interaction.reply(
      `🎲 **${formatExpr(expr)}** → [${breakdown}]${mod} = **${total}**`
    )
  }
}
