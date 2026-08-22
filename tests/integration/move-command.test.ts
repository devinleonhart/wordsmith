import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockGetMoveByName = vi.fn()

vi.mock('../../src/features/pokedex/pokemon-client', () => ({
  pokemonClient: {},
  moveClient: { getMoveByName: mockGetMoveByName }
}))

describe('Move Command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let interaction: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/features/pokedex/commands/move')
    interaction = {
      options: { getString: vi.fn() },
      reply: vi.fn(),
      deferReply: vi.fn(),
      editReply: vi.fn()
    }
  })

  it('should have correct command name and description', () => {
    expect(cmd.default.data.name).toBe('move')
    expect(cmd.default.data.description).toMatch(/move/i)
  })

  it('should reply with an error when no name is provided', async () => {
    interaction.options.getString.mockReturnValue(null)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith('Please provide a move name.')
    expect(mockGetMoveByName).not.toHaveBeenCalled()
  })

  it('should format a standard physical move with an effect', async () => {
    interaction.options.getString.mockReturnValue('earthquake')
    mockGetMoveByName.mockResolvedValue({
      name: 'earthquake',
      type: { name: 'ground' },
      damage_class: { name: 'physical' },
      power: 100,
      accuracy: 100,
      pp: 10,
      priority: 0,
      effect_chance: null,
      effect_entries: [{ language: { name: 'en' }, short_effect: 'Hits all adjacent Pokémon.' }]
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      '**Earthquake** — Ground · Physical\nPower: 100  ·  Accuracy: 100%  ·  PP: 10\n\nHits all adjacent Pokémon.'
    )
  })

  it('should omit power for status moves', async () => {
    interaction.options.getString.mockReturnValue('toxic')
    mockGetMoveByName.mockResolvedValue({
      name: 'toxic',
      type: { name: 'poison' },
      damage_class: { name: 'status' },
      power: null,
      accuracy: 90,
      pp: 10,
      priority: 0,
      effect_chance: null,
      effect_entries: [{ language: { name: 'en' }, short_effect: 'Badly poisons the target.' }]
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      '**Toxic** — Poison · Status\nAccuracy: 90%  ·  PP: 10\n\nBadly poisons the target.'
    )
  })

  it('should show "Always hits" when accuracy is null', async () => {
    interaction.options.getString.mockReturnValue('swift')
    mockGetMoveByName.mockResolvedValue({
      name: 'swift',
      type: { name: 'normal' },
      damage_class: { name: 'special' },
      power: 60,
      accuracy: null,
      pp: 20,
      priority: 0,
      effect_chance: null,
      effect_entries: []
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      '**Swift** — Normal · Special\nPower: 60  ·  Always hits  ·  PP: 20'
    )
  })

  it('should include positive priority in stats line', async () => {
    interaction.options.getString.mockReturnValue('quick-attack')
    mockGetMoveByName.mockResolvedValue({
      name: 'quick-attack',
      type: { name: 'normal' },
      damage_class: { name: 'physical' },
      power: 40,
      accuracy: 100,
      pp: 30,
      priority: 1,
      effect_chance: null,
      effect_entries: []
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      '**Quick Attack** — Normal · Physical\nPower: 40  ·  Accuracy: 100%  ·  PP: 30  ·  Priority: +1'
    )
  })

  it('should include negative priority in stats line', async () => {
    interaction.options.getString.mockReturnValue('trick-room')
    mockGetMoveByName.mockResolvedValue({
      name: 'trick-room',
      type: { name: 'psychic' },
      damage_class: { name: 'status' },
      power: null,
      accuracy: null,
      pp: 5,
      priority: -7,
      effect_chance: null,
      effect_entries: [{ language: { name: 'en' }, short_effect: 'Slower Pokémon move first.' }]
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      '**Trick Room** — Psychic · Status\nAlways hits  ·  PP: 5  ·  Priority: -7\n\nSlower Pokémon move first.'
    )
  })

  it('should substitute $effect_chance in the effect text', async () => {
    interaction.options.getString.mockReturnValue('fire-blast')
    mockGetMoveByName.mockResolvedValue({
      name: 'fire-blast',
      type: { name: 'fire' },
      damage_class: { name: 'special' },
      power: 110,
      accuracy: 85,
      pp: 5,
      priority: 0,
      effect_chance: 10,
      effect_entries: [{ language: { name: 'en' }, short_effect: 'Has a $effect_chance% chance to burn.' }]
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      '**Fire Blast** — Fire · Special\nPower: 110  ·  Accuracy: 85%  ·  PP: 5\n\nHas a 10% chance to burn.'
    )
  })

  it('should normalize input: lowercase and replace spaces with hyphens', async () => {
    interaction.options.getString.mockReturnValue('Ice Beam')
    mockGetMoveByName.mockResolvedValue({
      name: 'ice-beam',
      type: { name: 'ice' },
      damage_class: { name: 'special' },
      power: 90,
      accuracy: 100,
      pp: 10,
      priority: 0,
      effect_chance: null,
      effect_entries: []
    })
    await cmd.default.execute(interaction)
    expect(mockGetMoveByName).toHaveBeenCalledWith('ice-beam')
  })

  it('should omit damage class when null', async () => {
    interaction.options.getString.mockReturnValue('struggle')
    mockGetMoveByName.mockResolvedValue({
      name: 'struggle',
      type: { name: 'normal' },
      damage_class: null,
      power: 50,
      accuracy: null,
      pp: null,
      priority: 0,
      effect_chance: null,
      effect_entries: []
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      '**Struggle** — Normal\nPower: 50  ·  Always hits'
    )
  })

  it('should use the raw input name in the not-found error message', async () => {
    interaction.options.getString.mockReturnValue('Fake Move')
    mockGetMoveByName.mockRejectedValue(new Error('404'))
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      'Could not find a move named "Fake Move". Please check the spelling and try again.'
    )
  })
})
