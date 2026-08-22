import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockCalculateTypeEffectiveness = vi.fn()

vi.mock('../../src/features/pokedex/pokemon-client', () => ({
  pokemonClient: {},
  moveClient: {}
}))

vi.mock('../../src/features/pokedex/pokemon-types', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/features/pokedex/pokemon-types')>()
  return { ...actual, calculateTypeEffectiveness: mockCalculateTypeEffectiveness }
})

describe('Typecheck Command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let interaction: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/features/pokedex/commands/typecheck')
    interaction = {
      options: { getString: vi.fn() },
      reply: vi.fn()
    }
  })

  it('should have correct command name and description', () => {
    expect(cmd.default.data.name).toBe('typecheck')
    expect(cmd.default.data.description).toBe('Check type effectiveness of an attack against a Pokémon.')
  })

  it('should reply with an error when attack type is missing', async () => {
    interaction.options.getString
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('water')
      .mockReturnValueOnce(null)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      'Please provide at least an attack type and one defender type.'
    )
    expect(mockCalculateTypeEffectiveness).not.toHaveBeenCalled()
  })

  it('should reply with an error when defender type is missing', async () => {
    interaction.options.getString
      .mockReturnValueOnce('electric')
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      'Please provide at least an attack type and one defender type.'
    )
    expect(mockCalculateTypeEffectiveness).not.toHaveBeenCalled()
  })

  it('should calculate single-type effectiveness', async () => {
    interaction.options.getString
      .mockReturnValueOnce('electric')
      .mockReturnValueOnce('water')
      .mockReturnValueOnce(null)
    mockCalculateTypeEffectiveness.mockResolvedValue(2)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      "**Electric** vs **Water**\nIt's super effective! (2×)"
    )
  })

  it('should calculate dual-type effectiveness', async () => {
    interaction.options.getString
      .mockReturnValueOnce('electric')
      .mockReturnValueOnce('water')
      .mockReturnValueOnce('rock')
    mockCalculateTypeEffectiveness.mockResolvedValue(2)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      "**Electric** vs **Water/Rock**\nIt's super effective! (2×)"
    )
  })

  it('should report no effect', async () => {
    interaction.options.getString
      .mockReturnValueOnce('electric')
      .mockReturnValueOnce('ground')
      .mockReturnValueOnce(null)
    mockCalculateTypeEffectiveness.mockResolvedValue(0)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      '**Electric** vs **Ground**\nIt has no effect!'
    )
  })

  it('should report quad effectiveness', async () => {
    interaction.options.getString
      .mockReturnValueOnce('fire')
      .mockReturnValueOnce('grass')
      .mockReturnValueOnce('ice')
    mockCalculateTypeEffectiveness.mockResolvedValue(4)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      "**Fire** vs **Grass/Ice**\nIt's extremely effective! (4×)"
    )
  })

  it('should capitalise type names in the output', async () => {
    interaction.options.getString
      .mockReturnValueOnce('psychic')
      .mockReturnValueOnce('fighting')
      .mockReturnValueOnce('poison')
    mockCalculateTypeEffectiveness.mockResolvedValue(4)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      "**Psychic** vs **Fighting/Poison**\nIt's extremely effective! (4×)"
    )
  })

  it('should pass the correct types to calculateTypeEffectiveness for dual-type', async () => {
    interaction.options.getString
      .mockReturnValueOnce('water')
      .mockReturnValueOnce('fire')
      .mockReturnValueOnce('rock')
    mockCalculateTypeEffectiveness.mockResolvedValue(4)
    await cmd.default.execute(interaction)
    expect(mockCalculateTypeEffectiveness).toHaveBeenCalledWith('water', ['fire', 'rock'])
  })

  it('should pass single-element array when no secondary type', async () => {
    interaction.options.getString
      .mockReturnValueOnce('water')
      .mockReturnValueOnce('fire')
      .mockReturnValueOnce(null)
    mockCalculateTypeEffectiveness.mockResolvedValue(2)
    await cmd.default.execute(interaction)
    expect(mockCalculateTypeEffectiveness).toHaveBeenCalledWith('water', ['fire'])
  })

  it('should report a generic error on API failure', async () => {
    interaction.options.getString
      .mockReturnValueOnce('fire')
      .mockReturnValueOnce('water')
      .mockReturnValueOnce(null)
    mockCalculateTypeEffectiveness.mockRejectedValue(new Error('API error'))
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      'An error occurred while calculating type effectiveness.'
    )
  })
})
