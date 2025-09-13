import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockGetPokemonByName = vi.fn()

vi.mock('pokenode-ts', () => ({
  PokemonClient: vi.fn().mockImplementation(() => ({
    getPokemonByName: mockGetPokemonByName
  }))
}))

describe('Pokemon Command Integration', () => {
  let pokemonCommand: any
  let mockInteraction: any

  beforeEach(async () => {
    vi.clearAllMocks()

    pokemonCommand = require('../../dist/commands/game/pokemon')

    mockInteraction = {
      options: {
        getString: vi.fn()
      },
      reply: vi.fn(),
      deferReply: vi.fn(),
      editReply: vi.fn()
    }
  })

  it('should have correct command configuration', () => {
    expect(pokemonCommand.data.name).toBe('pokemon')
    expect(pokemonCommand.data.description).toBe('Get the types of a Pokémon by name.')
  })

  it('should format single type correctly', async () => {
    mockInteraction.options.getString.mockReturnValue('charmander')
    mockGetPokemonByName.mockResolvedValue({
      name: 'charmander',
      types: [{ type: { name: 'fire' } }]
    })

    await pokemonCommand.execute(mockInteraction)

    expect(mockInteraction.editReply).toHaveBeenCalledWith('**Charmander** is a fire type Pokémon.')
  })

  it('should format multiple types correctly', async () => {
    mockInteraction.options.getString.mockReturnValue('bulbasaur')
    mockGetPokemonByName.mockResolvedValue({
      name: 'bulbasaur',
      types: [
        { type: { name: 'grass' } },
        { type: { name: 'poison' } }
      ]
    })

    await pokemonCommand.execute(mockInteraction)

    expect(mockInteraction.editReply).toHaveBeenCalledWith('**Bulbasaur** is a grass, poison type Pokémon.')
  })

  it('should handle Pokemon not found error', async () => {
    mockInteraction.options.getString.mockReturnValue('fakemon')
    mockGetPokemonByName.mockRejectedValue(new Error('Not found'))

    await pokemonCommand.execute(mockInteraction)

    expect(mockInteraction.editReply).toHaveBeenCalledWith('Could not find a Pokémon named "fakemon". Please check the spelling and try again.')
  })

  it('should handle missing name gracefully', async () => {
    mockInteraction.options.getString.mockReturnValue(null)

    await pokemonCommand.execute(mockInteraction)

    expect(mockInteraction.reply).toHaveBeenCalledWith('Please provide a Pokémon name.')
    expect(mockGetPokemonByName).not.toHaveBeenCalled()
  })
})
