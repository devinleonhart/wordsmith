import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockGetPokemonByName = vi.fn()
const mockCalculateTypeEffectiveness = vi.fn()

vi.mock('../../src/utils/pokemon-client', () => ({
  pokemonClient: { getPokemonByName: mockGetPokemonByName },
  moveClient: {}
}))

vi.mock('../../src/utils/pokemon-types', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/pokemon-types')>()
  return { ...actual, calculateTypeEffectiveness: mockCalculateTypeEffectiveness }
})

describe('Effectiveness Command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let interaction: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/commands/game/effectiveness')
    interaction = {
      options: { getString: vi.fn() },
      reply: vi.fn(),
      deferReply: vi.fn(),
      editReply: vi.fn()
    }
  })

  it('should have correct command name and description', () => {
    expect(cmd.default.data.name).toBe('effectiveness')
    expect(cmd.default.data.description).toMatch(/effective/i)
  })

  it('should reply with an error when attack type is missing', async () => {
    interaction.options.getString
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('charizard')
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      'Please provide both an attack type and a Pokémon name.'
    )
    expect(mockGetPokemonByName).not.toHaveBeenCalled()
  })

  it('should reply with an error when Pokémon name is missing', async () => {
    interaction.options.getString
      .mockReturnValueOnce('water')
      .mockReturnValueOnce(null)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith(
      'Please provide both an attack type and a Pokémon name.'
    )
  })

  it('should calculate effectiveness against a single-type Pokémon', async () => {
    interaction.options.getString
      .mockReturnValueOnce('electric')
      .mockReturnValueOnce('pikachu')
    mockGetPokemonByName.mockResolvedValue({
      name: 'pikachu',
      types: [{ type: { name: 'electric' } }]
    })
    mockCalculateTypeEffectiveness.mockResolvedValue(0.5)
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      "**Electric** vs **Pikachu** (Electric)\nIt's not very effective... (0.5×)"
    )
  })

  it('should calculate effectiveness against a dual-type Pokémon', async () => {
    interaction.options.getString
      .mockReturnValueOnce('water')
      .mockReturnValueOnce('charizard')
    mockGetPokemonByName.mockResolvedValue({
      name: 'charizard',
      types: [{ type: { name: 'fire' } }, { type: { name: 'flying' } }]
    })
    mockCalculateTypeEffectiveness.mockResolvedValue(2)
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      "**Water** vs **Charizard** (Fire/Flying)\nIt's super effective! (2×)"
    )
  })

  it('should pass the Pokémon types to calculateTypeEffectiveness', async () => {
    interaction.options.getString
      .mockReturnValueOnce('fire')
      .mockReturnValueOnce('squirtle')
    mockGetPokemonByName.mockResolvedValue({
      name: 'squirtle',
      types: [{ type: { name: 'water' } }]
    })
    mockCalculateTypeEffectiveness.mockResolvedValue(0.5)
    await cmd.default.execute(interaction)
    expect(mockCalculateTypeEffectiveness).toHaveBeenCalledWith('fire', ['water'])
  })

  it('should pass the lowercased Pokémon name to the API', async () => {
    interaction.options.getString
      .mockReturnValueOnce('fire')
      .mockReturnValueOnce('SQUIRTLE')
    mockGetPokemonByName.mockResolvedValue({
      name: 'squirtle',
      types: [{ type: { name: 'water' } }]
    })
    mockCalculateTypeEffectiveness.mockResolvedValue(0.5)
    await cmd.default.execute(interaction)
    expect(mockGetPokemonByName).toHaveBeenCalledWith('squirtle')
  })

  it('should report not-found error for a 404 response', async () => {
    interaction.options.getString
      .mockReturnValueOnce('fire')
      .mockReturnValueOnce('fakemon')
    mockGetPokemonByName.mockRejectedValue(new Error('404 Not Found'))
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      'Could not find a Pokémon named "fakemon". Please check the spelling and try again.'
    )
  })

  it('should report a generic error for non-404 failures', async () => {
    interaction.options.getString
      .mockReturnValueOnce('fire')
      .mockReturnValueOnce('bulbasaur')
    mockGetPokemonByName.mockRejectedValue(new Error('Network timeout'))
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      'An error occurred while looking up the Pokémon or calculating effectiveness.'
    )
  })
})
