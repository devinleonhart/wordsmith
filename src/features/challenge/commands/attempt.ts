import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction } from 'discord.js'
import { WordsmithError } from '../../../core/errors'
import { getActiveCharacter, getItems, getWords } from '../../roster/characterRepository'
import { getGm } from '../guildRepository'
import { type SessionTag, createSession, updateSession } from '../sessionRepository'
import { render } from '../attempt'

const MAX_TAGS = 25 // Discord select-menu option cap

export default {
  data: new SlashCommandBuilder()
    .setName('attempt')
    .setDescription('Attempt a challenge: invoke your words/items and roll (GM-adjudicated).')
    .addStringOption(opt =>
      opt.setName('idea').setDescription('What you\'re trying to do.').setRequired(false)
    ),

  async execute (interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId
    const channelId = interaction.channelId
    if (!guildId) throw new WordsmithError('Challenges can only be attempted in a server.')
    if (!getGm(guildId)) throw new WordsmithError('No GM is set. Ask someone to run `/gm set` first.')

    const character = getActiveCharacter(interaction.user.id)
    if (!character) throw new WordsmithError('You have no active character. Use `/character create` or `/character switch` first.')

    const tags: SessionTag[] = [
      ...getWords(character.id).map(name => ({ name, kind: 'word' as const, on: false })),
      ...getItems(character.id).map(name => ({ name, kind: 'item' as const, on: false }))
    ].slice(0, MAX_TAGS)

    const idea = interaction.options.getString('idea') ?? ''
    const session = createSession({
      guildId,
      channelId,
      playerId: interaction.user.id,
      characterId: character.id,
      idea,
      tags
    })

    const view = render(session)
    const message = await interaction.reply({
      content: view.content,
      components: view.components,
      withResponse: true
    })
    const messageId = message.resource?.message?.id
    if (messageId) updateSession(session.id, { messageId })
  }
}
