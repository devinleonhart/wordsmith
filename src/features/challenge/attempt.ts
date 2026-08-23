import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Interaction,
  type MessageActionRowComponentBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js'
import { resolveChallenge, applyStar } from '../dice/engine'
import { formatResult } from '../dice/format'
import { getCharacterById, setStar } from '../roster/characterRepository'
import { isGm } from './guildRepository'
import {
  BASE_PLAYER_DICE,
  type RollSession,
  deleteSession,
  getSession,
  playerPool,
  updateSession
} from './sessionRepository'

const MAX_CREATIVITY = 10
const CHALLENGE_MAX = 10

// ---------------------------------------------------------------------------
// Pure transitions (exported for testing) — each returns the patched session.
// ---------------------------------------------------------------------------

export function setInvokedTags (session: RollSession, invoked: string[]): RollSession {
  const set = new Set(invoked)
  session.tags = session.tags.map(t => ({ ...t, on: set.has(t.name) }))
  return session
}

export function vetoTags (session: RollSession, names: string[]): RollSession {
  const veto = new Set(names)
  session.tags = session.tags.filter(t => !veto.has(t.name))
  return session
}

export function adjustCreativity (session: RollSession, delta: number): RollSession {
  session.creativityDice = Math.max(0, Math.min(MAX_CREATIVITY, session.creativityDice + delta))
  return session
}

export function setChallenge (session: RollSession, dice: number): RollSession {
  session.challengeDice = Math.max(1, Math.min(CHALLENGE_MAX, dice))
  return session
}

function invokedTags (session: RollSession): string[] {
  return session.tags.filter(t => t.on).map(t => t.name)
}

function poolSource (session: RollSession): string {
  const parts = [`base ${BASE_PLAYER_DICE}`, ...invokedTags(session)]
  if (session.creativityDice > 0) parts.push(`creativity +${session.creativityDice}`)
  return parts.join(' + ')
}

function starAvailable (session: RollSession): boolean {
  if (session.characterId == null || !session.result || session.result.tier === 'crit') return false
  return getCharacterById(session.characterId)?.star ?? false
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

type Row = ActionRowBuilder<MessageActionRowComponentBuilder>

export interface RenderedMessage {
  content: string
  components: Row[]
}

function id (action: string, session: RollSession): string {
  return `att:${action}:${session.id}`
}

export function render (session: RollSession): RenderedMessage {
  const header = session.idea
    ? `🎲 <@${session.playerId}> attempts: *${session.idea}*`
    : `🎲 <@${session.playerId}> makes an attempt`

  switch (session.status) {
    case 'proposing': {
      const content = [
        header,
        `**Player pool:** ${poolSource(session)} = **${playerPool(session)}**`,
        '_Pick the words & items you\'re using, then propose to the GM._'
      ].join('\n')

      const rows: Row[] = []
      if (session.tags.length > 0) {
        const select = new StringSelectMenuBuilder()
          .setCustomId(id('tags', session))
          .setPlaceholder('Words & items to invoke')
          .setMinValues(0)
          .setMaxValues(session.tags.length)
          .addOptions(session.tags.map(t =>
            new StringSelectMenuOptionBuilder()
              .setLabel(`${t.name} (${t.kind})`)
              .setValue(t.name)
              .setDefault(t.on)
          ))
        rows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(select))
      }
      rows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder().setCustomId(id('propose', session)).setLabel('Propose to GM').setStyle(ButtonStyle.Primary)
      ))
      return { content, components: rows }
    }

    case 'awaiting_gm': {
      const content = [
        header,
        `**Player pool:** ${poolSource(session)} = **${playerPool(session)}**`,
        `**Challenge:** ${session.challengeDice > 0 ? `**${session.challengeDice}**` : '_not set_'}`,
        '_GM: veto tags, adjust creativity, set the challenge, then approve._'
      ].join('\n')

      const rows: Row[] = []
      const invoked = session.tags.filter(t => t.on)
      if (invoked.length > 0) {
        const veto = new StringSelectMenuBuilder()
          .setCustomId(id('veto', session))
          .setPlaceholder('Veto tags (select to remove)')
          .setMinValues(0)
          .setMaxValues(invoked.length)
          .addOptions(invoked.map(t =>
            new StringSelectMenuOptionBuilder().setLabel(`${t.name} (${t.kind})`).setValue(t.name)
          ))
        rows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(veto))
      }
      const challenge = new StringSelectMenuBuilder()
        .setCustomId(id('chal', session))
        .setPlaceholder('Set challenge difficulty')
        .addOptions(Array.from({ length: CHALLENGE_MAX }, (_v, i) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${i + 1}${i + 1 === 6 ? ' — Standard' : ''}`)
            .setValue(String(i + 1))
            .setDefault(session.challengeDice === i + 1)
        ))
      rows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(challenge))
      rows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder().setCustomId(id('creaDown', session)).setLabel('− creativity').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(id('creaUp', session)).setLabel('+ creativity').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(id('approve', session)).setLabel('Approve').setStyle(ButtonStyle.Success).setDisabled(session.challengeDice < 1)
      ))
      return { content, components: rows }
    }

    case 'approved': {
      const content = [
        header,
        `**Final:** ${playerPool(session)} player vs ${session.challengeDice} challenge`,
        '_Player: press Roll._'
      ].join('\n')
      return {
        content,
        components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          new ButtonBuilder().setCustomId(id('roll', session)).setLabel('Roll').setStyle(ButtonStyle.Primary)
        )]
      }
    }

    case 'resolved': {
      const content = session.result
        ? formatResult(session.result, {
            title: header.replace('🎲 ', ''),
            playerSource: poolSource(session),
            challengeSource: session.challengeDice === 6 ? 'Standard' : undefined
          })
        : header
      const rows: Row[] = []
      if (starAvailable(session)) {
        rows.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          new ButtonBuilder().setCustomId(id('star', session)).setLabel('Spend ⭐').setStyle(ButtonStyle.Success)
        ))
      }
      return { content, components: rows }
    }
  }
}

// ---------------------------------------------------------------------------
// Component routing
// ---------------------------------------------------------------------------

export function isAttemptComponent (customId: string): boolean {
  return customId.startsWith('att:')
}

async function reject (interaction: Interaction, msg: string): Promise<void> {
  if (interaction.isMessageComponent()) {
    await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral })
  }
}

export async function handleComponent (interaction: Interaction): Promise<void> {
  if (!interaction.isMessageComponent()) return
  const [, action, sessionId] = interaction.customId.split(':')
  const session = getSession(sessionId)
  if (!session) { await reject(interaction, 'This roll has expired.'); return }

  const isPlayer = interaction.user.id === session.playerId
  const gm = interaction.guildId != null && isGm(interaction.guildId, interaction.user.id)

  // Player-only vs GM-only gating per stage.
  const playerActions = new Set(['tags', 'propose', 'roll', 'star'])
  if (playerActions.has(action) && !isPlayer) { await reject(interaction, 'Only the player who started this roll can do that.'); return }
  if (!playerActions.has(action) && !gm) { await reject(interaction, 'Only the GM can adjudicate this roll.'); return }

  switch (action) {
    case 'tags':
      if (interaction.isStringSelectMenu()) setInvokedTags(session, interaction.values)
      updateSession(session.id, { tags: session.tags })
      break
    case 'propose':
      session.status = 'awaiting_gm'
      updateSession(session.id, { status: 'awaiting_gm' })
      break
    case 'veto':
      if (interaction.isStringSelectMenu()) vetoTags(session, interaction.values)
      updateSession(session.id, { tags: session.tags })
      break
    case 'chal':
      if (interaction.isStringSelectMenu()) setChallenge(session, Number(interaction.values[0]))
      updateSession(session.id, { challengeDice: session.challengeDice })
      break
    case 'creaUp':
      adjustCreativity(session, 1)
      updateSession(session.id, { creativityDice: session.creativityDice })
      break
    case 'creaDown':
      adjustCreativity(session, -1)
      updateSession(session.id, { creativityDice: session.creativityDice })
      break
    case 'approve':
      session.status = 'approved'
      updateSession(session.id, { status: 'approved' })
      break
    case 'roll': {
      session.result = resolveChallenge(playerPool(session), session.challengeDice)
      session.status = 'resolved'
      updateSession(session.id, { result: session.result, status: 'resolved' })
      break
    }
    case 'star': {
      if (session.result && session.characterId != null) {
        session.result.tier = applyStar(session.result.tier)
        setStar(session.characterId, false)
        updateSession(session.id, { result: session.result })
      }
      break
    }
    default:
      await reject(interaction, 'Unknown action.')
      return
  }

  const view = render(session)
  await interaction.update({ content: view.content, components: view.components })

  // Clean up finished sessions with no further interaction possible.
  if (session.status === 'resolved' && view.components.length === 0) {
    deleteSession(session.id)
  }
}
