import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js'
import { WordsmithError } from '../../../core/errors'
import { getGm, setGm } from '../guildRepository'

export default {
  data: new SlashCommandBuilder()
    .setName('gm')
    .setDescription('Configure who runs the game (the GM) in this server.')
    .addSubcommand(sub =>
      sub
        .setName('set')
        .setDescription('Set the GM for this server.')
        .addUserOption(opt =>
          opt.setName('user').setDescription('The user to make GM.').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('show').setDescription('Show the current GM for this server.')
    ),

  async execute (interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId
    if (!guildId) throw new WordsmithError('The GM can only be configured in a server.')

    const sub = interaction.options.getSubcommand()

    if (sub === 'set') {
      const user = interaction.options.getUser('user', true)
      setGm(guildId, user.id)
      await interaction.reply({
        content: `🎬 <@${user.id}> is now the GM.`,
        allowedMentions: { users: [] }
      })
      return
    }

    // show
    const gm = getGm(guildId)
    await interaction.reply({
      content: gm ? `The current GM is <@${gm}>.` : 'No GM is set. Use `/gm set` to choose one.',
      allowedMentions: { users: [] },
      flags: MessageFlags.Ephemeral
    })
  }
}
