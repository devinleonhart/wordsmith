import { type TypeRelations } from 'pokenode-ts'
import { pokemonClient } from './pokemon-client'

// The 18 current types — used synchronously for slash command option lists.
const VALID_TYPES = [
  'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
  'fire', 'flying', 'ghost', 'grass', 'ground', 'ice',
  'normal', 'poison', 'psychic', 'rock', 'steel', 'water'
]

// Module-level cache so each type is fetched from the API at most once per process.
const typeRelationsCache = new Map<string, TypeRelations>()

export async function calculateTypeEffectiveness(
  attackType: string,
  defenderTypes: string[]
): Promise<number> {
  const normalizedAttack = attackType.toLowerCase()
  const normalizedDefenders = defenderTypes.map(t => t.toLowerCase())

  let relations = typeRelationsCache.get(normalizedAttack)
  if (!relations) {
    const typeData = await pokemonClient.getTypeByName(normalizedAttack)
    relations = typeData.damage_relations
    typeRelationsCache.set(normalizedAttack, relations)
  }

  let multiplier = 1
  for (const defenderType of normalizedDefenders) {
    if (relations.no_damage_to.some(t => t.name === defenderType)) {
      multiplier *= 0
    } else if (relations.half_damage_to.some(t => t.name === defenderType)) {
      multiplier *= 0.5
    } else if (relations.double_damage_to.some(t => t.name === defenderType)) {
      multiplier *= 2
    }
    // else: neutral — multiplier unchanged
  }

  return multiplier
}

export function getEffectivenessDescription(multiplier: number): string {
  if (multiplier === 0) return 'It has no effect!'
  if (multiplier === 0.25) return "It's not very effective... (0.25×)"
  if (multiplier === 0.5) return "It's not very effective... (0.5×)"
  if (multiplier === 1) return "It's normally effective. (1×)"
  if (multiplier === 2) return "It's super effective! (2×)"
  if (multiplier === 4) return "It's extremely effective! (4×)"
  return `It deals ${multiplier}× damage.`
}

export function getValidTypes(): string[] {
  return [...VALID_TYPES]
}
