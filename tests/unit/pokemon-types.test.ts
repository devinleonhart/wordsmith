import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculateTypeEffectiveness,
  getEffectivenessDescription,
  getValidTypes
} from '../../src/utils/pokemon-types'

// Build a minimal damage_relations object for use in mocks.
function makeRelations(doubleTo: string[], halfTo: string[], noTo: string[]) {
  const res = (names: string[]) => names.map(name => ({ name, url: '' }))
  return {
    damage_relations: {
      double_damage_to: res(doubleTo),
      half_damage_to: res(halfTo),
      no_damage_to: res(noTo),
      double_damage_from: [],
      half_damage_from: [],
      no_damage_from: []
    }
  }
}

const { mockGetTypeByName } = vi.hoisted(() => ({ mockGetTypeByName: vi.fn() }))

vi.mock('../../src/utils/pokemon-client', () => ({
  pokemonClient: { getTypeByName: mockGetTypeByName },
  moveClient: {}
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('calculateTypeEffectiveness', () => {
  it('should return 2 for a super-effective matchup', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['water', 'flying'], ['electric', 'grass', 'dragon'], ['ground'])
    )
    expect(await calculateTypeEffectiveness('electric', ['water'])).toBe(2)
  })

  it('should return 0.5 for a not-very-effective matchup', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['water', 'flying'], ['electric', 'grass', 'dragon'], ['ground'])
    )
    expect(await calculateTypeEffectiveness('electric', ['electric'])).toBe(0.5)
  })

  it('should return 0 for an immunity', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['water', 'flying'], ['electric', 'grass', 'dragon'], ['ground'])
    )
    expect(await calculateTypeEffectiveness('electric', ['ground'])).toBe(0)
  })

  it('should return 1 for a neutral matchup', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['fighting', 'poison'], ['psychic', 'steel'], ['dark'])
    )
    expect(await calculateTypeEffectiveness('psychic', ['normal'])).toBe(1)
  })

  it('should multiply across dual defender types — super effective + neutral = 2', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['water', 'flying'], ['electric', 'grass', 'dragon'], ['ground'])
    )
    // electric vs water (2×) and rock (neutral 1×) = 2
    expect(await calculateTypeEffectiveness('electric', ['water', 'rock'])).toBe(2)
  })

  it('should multiply across dual defender types — 2× + 2× = 4', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['grass', 'ice', 'bug', 'steel'], ['fire', 'water', 'rock', 'dragon'], [])
    )
    expect(await calculateTypeEffectiveness('fire', ['grass', 'ice'])).toBe(4)
  })

  it('should short-circuit to 0 when one defender type is immune', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['water', 'flying'], ['electric', 'grass', 'dragon'], ['ground'])
    )
    // electric vs water (2×) and ground (0×) = 0
    expect(await calculateTypeEffectiveness('electric', ['water', 'ground'])).toBe(0)
  })

  it('should return 1 for a defender type absent from all damage relations', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['grass', 'ice', 'bug', 'steel'], ['fire', 'water', 'rock', 'dragon'], [])
    )
    // fire vs flying is neutral (not in fire's relations)
    expect(await calculateTypeEffectiveness('fire', ['flying'])).toBe(1)
  })

  it('should return 1 for an empty defender types array', async () => {
    mockGetTypeByName.mockResolvedValue(makeRelations(['water'], [], []))
    expect(await calculateTypeEffectiveness('electric', [])).toBe(1)
  })

  it('should be case-insensitive', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['water', 'flying'], ['electric', 'grass', 'dragon'], ['ground'])
    )
    expect(await calculateTypeEffectiveness('ELECTRIC', ['WATER'])).toBe(2)
    expect(await calculateTypeEffectiveness('Electric', ['Water'])).toBe(2)
  })

  it('should cache — getTypeByName is called only once per attack type', async () => {
    mockGetTypeByName.mockResolvedValue(
      makeRelations(['ice', 'rock', 'fairy'], ['fire', 'water', 'electric', 'steel'], [])
    )
    // Use 'steel' — not used as attack type in any other test, so the cache is cold here
    await calculateTypeEffectiveness('steel', ['ice'])
    await calculateTypeEffectiveness('steel', ['rock'])
    expect(mockGetTypeByName).toHaveBeenCalledTimes(1)
  })

  it('should propagate API errors for unknown attack types', async () => {
    mockGetTypeByName.mockRejectedValue(new Error('404'))
    await expect(calculateTypeEffectiveness('unknown', ['water'])).rejects.toThrow()
  })
})

describe('getEffectivenessDescription', () => {
  it('should describe no effect', () => {
    expect(getEffectivenessDescription(0)).toBe('It has no effect!')
  })

  it('should describe 0.25× damage', () => {
    expect(getEffectivenessDescription(0.25)).toBe("It's not very effective... (0.25×)")
  })

  it('should describe 0.5× damage', () => {
    expect(getEffectivenessDescription(0.5)).toBe("It's not very effective... (0.5×)")
  })

  it('should describe 1× damage', () => {
    expect(getEffectivenessDescription(1)).toBe("It's normally effective. (1×)")
  })

  it('should describe 2× damage', () => {
    expect(getEffectivenessDescription(2)).toBe("It's super effective! (2×)")
  })

  it('should describe 4× damage', () => {
    expect(getEffectivenessDescription(4)).toBe("It's extremely effective! (4×)")
  })

  it('should fall back to a generic multiplier string', () => {
    expect(getEffectivenessDescription(8)).toBe('It deals 8× damage.')
    expect(getEffectivenessDescription(0.1)).toBe('It deals 0.1× damage.')
  })
})

describe('getValidTypes', () => {
  it('should return exactly 18 types', () => {
    expect(getValidTypes()).toHaveLength(18)
  })

  it('should include all standard types', () => {
    const types = getValidTypes()
    const expected = [
      'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
      'fire', 'flying', 'ghost', 'grass', 'ground', 'ice',
      'normal', 'poison', 'psychic', 'rock', 'steel', 'water'
    ]
    for (const t of expected) expect(types).toContain(t)
  })

  it('should return types in alphabetical order', () => {
    const types = getValidTypes()
    expect(types).toEqual([...types].sort())
  })

  it('should return a copy — mutating the result does not affect subsequent calls', () => {
    const first = getValidTypes()
    first.push('shadow')
    expect(getValidTypes()).toHaveLength(18)
  })
})
