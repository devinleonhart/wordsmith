import { type ChallengeResult, type PlayerRoll, type Tier } from './engine'
import { DiscordEmotes, buildEmoteString } from './rules-util'

const TIER_LABEL: Record<Tier, string> = {
  crit: 'CRITICAL SUCCESS',
  success: 'SUCCESS',
  partial: 'PARTIAL SUCCESS',
  disaster: 'DISASTER'
}

const TIER_REACTION: Record<Tier, string> = {
  crit: DiscordEmotes.smirkingCatWithBeer,
  success: DiscordEmotes.smileCat,
  partial: DiscordEmotes.poutingCat,
  disaster: DiscordEmotes.skull
}

export function tierLabel (tier: Tier): string {
  return TIER_LABEL[tier]
}

export function tierReaction (tier: Tier): string {
  return TIER_REACTION[tier]
}

// ⭐⭐ 🟠🟠 🔵🔵  (stars, then hits, then blanks)
export function playerDiceEmotes (result: ChallengeResult): string {
  return (
    buildEmoteString(DiscordEmotes.star, result.player.stars) +
    buildEmoteString(DiscordEmotes.orangeDiamond, result.player.hits) +
    buildEmoteString(DiscordEmotes.blueDiamond, result.player.blanks)
  ).trim()
}

export function challengeDiceEmotes (result: ChallengeResult): string {
  return (
    buildEmoteString(DiscordEmotes.orangeDiamond, result.challenge.hits) +
    buildEmoteString(DiscordEmotes.blueDiamond, result.challenge.blanks)
  ).trim()
}

export function playerPoolEmotes (roll: PlayerRoll): string {
  return (
    buildEmoteString(DiscordEmotes.star, roll.stars) +
    buildEmoteString(DiscordEmotes.orangeDiamond, roll.hits) +
    buildEmoteString(DiscordEmotes.blueDiamond, roll.blanks)
  ).trim()
}

// A raw player-pool roll with no challenge (the /r command).
export function formatPlayerPool (playerName: string, roll: PlayerRoll): string {
  const count = roll.stars + roll.hits + roll.blanks
  const hits = roll.stars + roll.hits
  return `🎲 **${playerName}** rolls ${count} dice\n${playerPoolEmotes(roll)}  → **${hits}** hits`
}

export interface ResultFormatOptions {
  title?: string // e.g. `Aldric attempts: "vault the gap"`
  playerSource?: string // e.g. `base 3 + Strong + Rope`
  challengeSource?: string // e.g. `Standard, GM +1 creativity`
  effectiveTier?: Tier // overrides result.tier after a spent star
  starNote?: string // e.g. `⭐ spent → CRITICAL`
}

export function formatResult (result: ChallengeResult, opts: ResultFormatOptions = {}): string {
  const tier = opts.effectiveTier ?? result.tier
  const playerCount = result.player.stars + result.player.hits + result.player.blanks
  const challengeCount = result.challenge.hits + result.challenge.blanks

  const playerSrc = opts.playerSource ? ` = ${opts.playerSource}` : ''
  const challengeSrc = opts.challengeSource ? ` (${opts.challengeSource})` : ''

  const lines = [
    opts.title ? `🎲 ${opts.title}` : '🎲 **Challenge Roll**',
    `**Player** ${playerCount} dice${playerSrc}`,
    `${playerDiceEmotes(result)}  → **${result.playerHits}** hits`,
    `**Challenge** ${challengeCount} dice${challengeSrc}`,
    `${challengeDiceEmotes(result)}  → **${result.challengeHits}** hits`,
    `**${tierLabel(tier)}** ${tierReaction(tier)}`
  ]
  if (opts.starNote) lines.push(opts.starNote)
  return lines.join('\n')
}
