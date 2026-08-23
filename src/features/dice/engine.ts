import { random } from './rules-util'

// Wordsmith challenge resolution — pure logic, deterministic under the injectable
// rng() from rules-util so it is fully unit-testable.

export type Tier = 'disaster' | 'partial' | 'success' | 'crit'

export interface PlayerRoll {
  stars: number
  hits: number // "regular" hits, excluding stars
  blanks: number
}

export interface ChallengeRoll {
  hits: number
  blanks: number
}

export interface ChallengeResult {
  player: PlayerRoll
  challenge: ChallengeRoll
  playerHits: number // stars + hits (a star counts as a hit)
  challengeHits: number
  tier: Tier
}

// Player die: 8 faces — 3 hit, 1 star, 4 blank.
export function rollPlayerPool (dice: number): PlayerRoll {
  let stars = 0
  let hits = 0
  let blanks = 0
  for (let i = 0; i < dice; i++) {
    const face = Math.floor(random() * 8)
    if (face < 3) hits++
    else if (face === 3) stars++
    else blanks++
  }
  return { stars, hits, blanks }
}

// Challenge die: 8 faces — 4 hit, 4 blank, no star.
export function rollChallengePool (dice: number): ChallengeRoll {
  let hits = 0
  let blanks = 0
  for (let i = 0; i < dice; i++) {
    if (Math.floor(random() * 8) < 4) hits++
    else blanks++
  }
  return { hits, blanks }
}

// Ties go to the player; 2+ stars auto-crit; any hit but short = partial; nothing = disaster.
export function classify (stars: number, playerHits: number, challengeHits: number): Tier {
  if (stars >= 2) return 'crit'
  if (playerHits >= challengeHits) return 'success'
  if (playerHits >= 1) return 'partial'
  return 'disaster'
}

export function resolveChallenge (playerDice: number, challengeDice: number): ChallengeResult {
  const player = rollPlayerPool(playerDice)
  const challenge = rollChallengePool(challengeDice)
  const playerHits = player.stars + player.hits
  const tier = classify(player.stars, playerHits, challenge.hits)
  return { player, challenge, playerHits, challengeHits: challenge.hits, tier }
}

// Spending a star (after seeing the roll): any hit becomes a crit; a total whiff
// is only salvaged to a partial.
export function applyStar (tier: Tier): Tier {
  switch (tier) {
    case 'disaster': return 'partial'
    case 'partial': return 'crit'
    case 'success': return 'crit'
    case 'crit': return 'crit'
  }
}
