import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MessageFlags } from 'discord.js'
import { WordsmithError } from '../../src/classes/wordsmithError'

vi.mock('../../src/database/characterRepository', () => ({
  getActiveCharacter: vi.fn(),
  setStar: vi.fn()
}))

const makeInteraction = (targetUser: { id: string, displayName: string }) => ({
  user: { id: 'user-123' },
  options: {
    getUser: vi.fn(() => targetUser)
  },
  reply: vi.fn()
})

describe('/star command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let repo: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/commands/game/star')
    repo = await import('../../src/database/characterRepository')
  })

  it('is named star', () => {
    expect(cmd.default.data.name).toBe('star')
  })

  it('grants a star and replies with a public embed', async () => {
    repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })

    const interaction = makeInteraction({ id: 'target-456', displayName: 'Devin' })
    await cmd.default.execute(interaction)

    expect(repo.setStar).toHaveBeenCalledWith(1, true)
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('Aldric') })
    )
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.not.objectContaining({ flags: MessageFlags.Ephemeral })
    )
  })

  it('replies ephemerally when the character already has a star', async () => {
    repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: true })

    const interaction = makeInteraction({ id: 'target-456', displayName: 'Devin' })
    await cmd.default.execute(interaction)

    expect(repo.setStar).not.toHaveBeenCalled()
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ flags: MessageFlags.Ephemeral })
    )
  })

  it('throws WordsmithError when the target has no active character', async () => {
    repo.getActiveCharacter.mockReturnValue(null)

    await expect(
      cmd.default.execute(makeInteraction({ id: 'target-456', displayName: 'Devin' }))
    ).rejects.toThrow(WordsmithError)
  })

  it('works when the user stars themselves', async () => {
    repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })

    const interaction = makeInteraction({ id: 'user-123', displayName: 'Devin' })
    await cmd.default.execute(interaction)

    expect(repo.setStar).toHaveBeenCalledWith(1, true)
  })
})
