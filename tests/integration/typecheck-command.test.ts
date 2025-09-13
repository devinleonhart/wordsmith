import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Typecheck Command Integration', () => {
  let typecheckCommand: any
  let mockInteraction: any

  beforeEach(async () => {
    vi.clearAllMocks()

    typecheckCommand = require('../../dist/commands/game/typecheck')

    mockInteraction = {
      options: {
        getString: vi.fn()
      },
      reply: vi.fn()
    }
  })

  it('should have correct command configuration', () => {
    expect(typecheckCommand.data.name).toBe('typecheck')
    expect(typecheckCommand.data.description).toBe('Check type effectiveness of an attack against a Pokémon.')
  })

  it('should calculate single type effectiveness correctly', async () => {
    mockInteraction.options.getString
      .mockReturnValueOnce('electric')
      .mockReturnValueOnce('water')
      .mockReturnValueOnce(null)

    await typecheckCommand.execute(mockInteraction)

    expect(mockInteraction.reply).toHaveBeenCalledWith('**Electric** vs **Water**\nIt\'s super effective! (2×)')
  })

  it('should calculate dual type effectiveness correctly', async () => {
    mockInteraction.options.getString
      .mockReturnValueOnce('electric')
      .mockReturnValueOnce('water')
      .mockReturnValueOnce('rock')

    await typecheckCommand.execute(mockInteraction)

    expect(mockInteraction.reply).toHaveBeenCalledWith('**Electric** vs **Water/Rock**\nIt\'s super effective! (2×)')
  })

  it('should handle no effect correctly', async () => {
    mockInteraction.options.getString
      .mockReturnValueOnce('electric')
      .mockReturnValueOnce('ground')
      .mockReturnValueOnce(null)

    await typecheckCommand.execute(mockInteraction)

    expect(mockInteraction.reply).toHaveBeenCalledWith('**Electric** vs **Ground**\nIt has no effect!')
  })

  it('should handle quad effectiveness', async () => {
    mockInteraction.options.getString
      .mockReturnValueOnce('fire')
      .mockReturnValueOnce('grass')
      .mockReturnValueOnce('ice')

    await typecheckCommand.execute(mockInteraction)

    expect(mockInteraction.reply).toHaveBeenCalledWith('**Fire** vs **Grass/Ice**\nIt\'s extremely effective! (4×)')
  })

  it('should handle missing required parameters', async () => {
    mockInteraction.options.getString
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('water')
      .mockReturnValueOnce(null)

    await typecheckCommand.execute(mockInteraction)

    expect(mockInteraction.reply).toHaveBeenCalledWith('Please provide at least an attack type and one defender type.')
  })

  it('should handle missing defender type', async () => {
    mockInteraction.options.getString
      .mockReturnValueOnce('electric')
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)

    await typecheckCommand.execute(mockInteraction)

    expect(mockInteraction.reply).toHaveBeenCalledWith('Please provide at least an attack type and one defender type.')
  })

  it('should capitalize type names in output', async () => {
    mockInteraction.options.getString
      .mockReturnValueOnce('psychic')
      .mockReturnValueOnce('fighting')
      .mockReturnValueOnce('poison')

    await typecheckCommand.execute(mockInteraction)

    expect(mockInteraction.reply).toHaveBeenCalledWith('**Psychic** vs **Fighting/Poison**\nIt\'s extremely effective! (4×)')
  })
})
