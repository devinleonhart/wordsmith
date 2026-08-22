import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockGetPokemonByName = vi.fn()

vi.mock('../../src/features/pokedex/pokemon-client', () => ({
  pokemonClient: { getPokemonByName: mockGetPokemonByName },
  moveClient: {}
}))

describe('Pokemon Command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let interaction: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/features/pokedex/commands/pokemon')
    interaction = {
      options: { getString: vi.fn() },
      reply: vi.fn(),
      deferReply: vi.fn(),
      editReply: vi.fn()
    }
  })

  it('should have correct command name and description', () => {
    expect(cmd.default.data.name).toBe('pokemon')
    expect(cmd.default.data.description).toBe('Get the types of a Pokémon by name.')
  })

  it('should reply with an error when no name is provided', async () => {
    interaction.options.getString.mockReturnValue(null)
    await cmd.default.execute(interaction)
    expect(interaction.reply).toHaveBeenCalledWith('Please provide a Pokémon name.')
    expect(mockGetPokemonByName).not.toHaveBeenCalled()
  })

  it('should format a single-type Pokémon correctly', async () => {
    interaction.options.getString.mockReturnValue('charmander')
    mockGetPokemonByName.mockResolvedValue({
      name: 'charmander',
      types: [{ type: { name: 'fire' } }]
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith('**Charmander** is a fire type Pokémon.')
  })

  it('should format a dual-type Pokémon correctly', async () => {
    interaction.options.getString.mockReturnValue('bulbasaur')
    mockGetPokemonByName.mockResolvedValue({
      name: 'bulbasaur',
      types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }]
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith('**Bulbasaur** is a grass, poison type Pokémon.')
  })

  it('should capitalise the Pokémon name in the response', async () => {
    interaction.options.getString.mockReturnValue('pikachu')
    mockGetPokemonByName.mockResolvedValue({
      name: 'pikachu',
      types: [{ type: { name: 'electric' } }]
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      expect.stringContaining('**Pikachu**')
    )
  })

  it('should pass the lowercased name to the API', async () => {
    interaction.options.getString.mockReturnValue('CHARIZARD')
    mockGetPokemonByName.mockResolvedValue({
      name: 'charizard',
      types: [{ type: { name: 'fire' } }, { type: { name: 'flying' } }]
    })
    await cmd.default.execute(interaction)
    expect(mockGetPokemonByName).toHaveBeenCalledWith('charizard')
  })

  it('should reply with a not-found message on API error', async () => {
    interaction.options.getString.mockReturnValue('fakemon')
    mockGetPokemonByName.mockRejectedValue(new Error('Not found'))
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith(
      'Could not find a Pokémon named "fakemon". Please check the spelling and try again.'
    )
  })
})
