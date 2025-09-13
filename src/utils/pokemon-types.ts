/**
 * Pokémon type effectiveness chart
 * Key: attacking type, Value: object with defending types and their multipliers
 */
export const TYPE_EFFECTIVENESS: Record<string, Record<string, number>> = {
  normal: {
    ghost: 0,
    rock: 0.5,
    steel: 0.5
  },
  fire: {
    grass: 2,
    ice: 2,
    bug: 2,
    steel: 2,
    fire: 0.5,
    water: 0.5,
    rock: 0.5,
    dragon: 0.5
  },
  water: {
    fire: 2,
    ground: 2,
    rock: 2,
    water: 0.5,
    grass: 0.5,
    dragon: 0.5
  },
  grass: {
    water: 2,
    ground: 2,
    rock: 2,
    fire: 0.5,
    grass: 0.5,
    poison: 0.5,
    flying: 0.5,
    bug: 0.5,
    dragon: 0.5,
    steel: 0.5
  },
  electric: {
    water: 2,
    flying: 2,
    ground: 0,
    electric: 0.5,
    grass: 0.5,
    dragon: 0.5
  },
  ice: {
    grass: 2,
    ground: 2,
    flying: 2,
    dragon: 2,
    fire: 0.5,
    water: 0.5,
    ice: 0.5,
    steel: 0.5
  },
  fighting: {
    normal: 2,
    ice: 2,
    rock: 2,
    dark: 2,
    steel: 2,
    ghost: 0,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    fairy: 0.5
  },
  poison: {
    grass: 2,
    fairy: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0
  },
  ground: {
    fire: 2,
    electric: 2,
    poison: 2,
    rock: 2,
    steel: 2,
    flying: 0,
    grass: 0.5,
    bug: 0.5
  },
  flying: {
    grass: 2,
    fighting: 2,
    bug: 2,
    electric: 0.5,
    rock: 0.5,
    steel: 0.5
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    steel: 0.5,
    dark: 0
  },
  bug: {
    grass: 2,
    psychic: 2,
    dark: 2,
    fire: 0.5,
    fighting: 0.5,
    flying: 0.5,
    ghost: 0.5,
    poison: 0.5,
    steel: 0.5,
    fairy: 0.5
  },
  rock: {
    fire: 2,
    ice: 2,
    flying: 2,
    bug: 2,
    fighting: 0.5,
    ground: 0.5,
    steel: 0.5
  },
  ghost: {
    psychic: 2,
    ghost: 2,
    normal: 0,
    dark: 0.5
  },
  dragon: {
    dragon: 2,
    steel: 0.5,
    fairy: 0
  },
  dark: {
    psychic: 2,
    ghost: 2,
    fighting: 0.5,
    dark: 0.5,
    fairy: 0.5
  },
  steel: {
    ice: 2,
    rock: 2,
    fairy: 2,
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    steel: 0.5
  },
  fairy: {
    fighting: 2,
    dragon: 2,
    dark: 2,
    fire: 0.5,
    poison: 0.5,
    steel: 0.5
  }
}

/**
 * Calculate type effectiveness multiplier for an attack against a Pokémon
 * @param attackType The type of the attacking move
 * @param defenderTypes Array of the defending Pokémon's types (1 or 2 types)
 * @returns The cumulative damage multiplier
 */
export function calculateTypeEffectiveness(attackType: string, defenderTypes: string[]): number {
  const normalizedAttackType = attackType.toLowerCase()
  const normalizedDefenderTypes = defenderTypes.map(type => type.toLowerCase())

  // Start with neutral effectiveness (1x)
  let multiplier = 1

  // Apply effectiveness against each defender type
  for (const defenderType of normalizedDefenderTypes) {
    const effectiveness = TYPE_EFFECTIVENESS[normalizedAttackType]?.[defenderType] ?? 1
    multiplier *= effectiveness
  }

  return multiplier
}

/**
 * Get a human-readable description of the effectiveness
 * @param multiplier The effectiveness multiplier
 * @returns A descriptive string
 */
export function getEffectivenessDescription(multiplier: number): string {
  if (multiplier === 0) return "It has no effect!"
  if (multiplier === 0.25) return "It's not very effective... (0.25×)"
  if (multiplier === 0.5) return "It's not very effective... (0.5×)"
  if (multiplier === 1) return "It's normally effective. (1×)"
  if (multiplier === 2) return "It's super effective! (2×)"
  if (multiplier === 4) return "It's extremely effective! (4×)"
  return `It deals ${multiplier}× damage.`
}

/**
 * Get all valid Pokémon types
 * @returns Array of all valid type names
 */
export function getValidTypes(): string[] {
  return Object.keys(TYPE_EFFECTIVENESS).sort()
}
