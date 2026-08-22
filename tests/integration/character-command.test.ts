import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MessageFlags } from 'discord.js'
import { WordsmithError } from '../../src/core/errors'

vi.mock('../../src/features/roster/characterRepository', () => ({
  createCharacter: vi.fn(),
  getCharacters: vi.fn(),
  getActiveCharacter: vi.fn(),
  setActiveCharacter: vi.fn(),
  deleteCharacter: vi.fn(),
  addWord: vi.fn(),
  deleteWord: vi.fn(),
  getWords: vi.fn(),
  addItem: vi.fn(),
  deleteItem: vi.fn(),
  getItems: vi.fn()
}))

const makeInteraction = (
  subcommand: string,
  options: Record<string, string> = {},
  group: string | null = null
) => ({
  user: { id: 'user-123' },
  options: {
    getSubcommand: vi.fn(() => subcommand),
    getSubcommandGroup: vi.fn(() => group),
    getString: vi.fn((name: string, _required?: boolean) => options[name] ?? null)
  },
  reply: vi.fn()
})

const makeAutocompleteInteraction = (focused: string, group: string | null = null) => ({
  user: { id: 'user-123' },
  options: {
    getFocused: vi.fn(() => focused),
    getSubcommandGroup: vi.fn(() => group)
  },
  respond: vi.fn()
})

describe('/character command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let repo: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/features/roster/commands/character')
    repo = await import('../../src/features/roster/characterRepository')
  })

  it('is named character', () => {
    expect(cmd.default.data.name).toBe('character')
  })

  it('registers all five subcommands and the word group', () => {
    const names = cmd.default.data.options.map((o: { name: string }) => o.name)
    expect(names).toContain('create')
    expect(names).toContain('list')
    expect(names).toContain('switch')
    expect(names).toContain('delete')
    expect(names).toContain('info')
    expect(names).toContain('word')
  })

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create subcommand', () => {
    it('creates the character and replies with content', async () => {
      repo.getActiveCharacter.mockReturnValue(null)
      repo.createCharacter.mockReturnValue({ id: 1, userId: 'user-123', name: 'Aldric', star: false })

      const interaction = makeInteraction('create', { name: 'Aldric' })
      await cmd.default.execute(interaction)

      expect(repo.createCharacter).toHaveBeenCalledWith('user-123', 'Aldric', false)
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('Aldric'), flags: MessageFlags.Ephemeral })
      )
    })

    it('sets new character as active when user has no active character', async () => {
      repo.getActiveCharacter.mockReturnValue(null)
      repo.createCharacter.mockReturnValue({ id: 1, userId: 'user-123', name: 'Aldric', star: false })

      await cmd.default.execute(makeInteraction('create', { name: 'Aldric' }))

      expect(repo.setActiveCharacter).toHaveBeenCalledWith('user-123', 1)
    })

    it('does not change active when user already has one', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 99, name: 'Existing', star: false })
      repo.createCharacter.mockReturnValue({ id: 1, userId: 'user-123', name: 'Aldric', star: false })

      await cmd.default.execute(makeInteraction('create', { name: 'Aldric' }))

      expect(repo.setActiveCharacter).not.toHaveBeenCalled()
    })

    it('throws WordsmithError on duplicate name', async () => {
      repo.getActiveCharacter.mockReturnValue(null)
      repo.createCharacter.mockImplementation(() => { throw new Error('UNIQUE constraint failed') })

      await expect(
        cmd.default.execute(makeInteraction('create', { name: 'Aldric' }))
      ).rejects.toThrow(WordsmithError)
    })
  })

  // ---------------------------------------------------------------------------
  // list
  // ---------------------------------------------------------------------------
  describe('list subcommand', () => {
    it('replies with a prompt when the roster is empty', async () => {
      repo.getCharacters.mockReturnValue([])

      const interaction = makeInteraction('list')
      await cmd.default.execute(interaction)

      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('/character create'),
          flags: MessageFlags.Ephemeral
        })
      )
    })

    it('replies with an embed listing characters when roster is non-empty', async () => {
      const chars = [
        { id: 1, name: 'Aldric', star: false },
        { id: 2, name: 'Mira', star: true }
      ]
      repo.getCharacters.mockReturnValue(chars)
      repo.getActiveCharacter.mockReturnValue(chars[0])

      await cmd.default.execute(makeInteraction('list'))

      expect(repo.getCharacters).toHaveBeenCalledWith('user-123')
      expect(makeInteraction('list').reply).not.toHaveBeenCalled() // sanity
    })
  })

  // ---------------------------------------------------------------------------
  // switch
  // ---------------------------------------------------------------------------
  describe('switch subcommand', () => {
    it('sets the named character as active and replies with content', async () => {
      repo.getCharacters.mockReturnValue([{ id: 1, name: 'Aldric', star: false }])

      const interaction = makeInteraction('switch', { name: 'Aldric' })
      await cmd.default.execute(interaction)

      expect(repo.setActiveCharacter).toHaveBeenCalledWith('user-123', 1)
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('Aldric'), flags: MessageFlags.Ephemeral })
      )
    })

    it('throws WordsmithError when the character is not found', async () => {
      repo.getCharacters.mockReturnValue([])

      await expect(
        cmd.default.execute(makeInteraction('switch', { name: 'Ghost' }))
      ).rejects.toThrow(WordsmithError)
    })
  })

  // ---------------------------------------------------------------------------
  // delete
  // ---------------------------------------------------------------------------
  describe('delete subcommand', () => {
    it('deletes a non-active character and replies with content', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 99, name: 'Other', star: false })
      repo.deleteCharacter.mockReturnValue(true)

      const interaction = makeInteraction('delete', { name: 'Aldric' })
      await cmd.default.execute(interaction)

      expect(repo.deleteCharacter).toHaveBeenCalledWith('user-123', 'Aldric')
      expect(repo.setActiveCharacter).not.toHaveBeenCalled()
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('Aldric'), flags: MessageFlags.Ephemeral })
      )
    })

    it('auto-promotes the oldest remaining character when deleting the active', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.deleteCharacter.mockReturnValue(true)
      repo.getCharacters.mockReturnValue([{ id: 2, name: 'Mira', star: false }])

      await cmd.default.execute(makeInteraction('delete', { name: 'Aldric' }))

      expect(repo.setActiveCharacter).toHaveBeenCalledWith('user-123', 2)
    })

    it('does not promote when no characters remain after deleting the active', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.deleteCharacter.mockReturnValue(true)
      repo.getCharacters.mockReturnValue([])

      await cmd.default.execute(makeInteraction('delete', { name: 'Aldric' }))

      expect(repo.setActiveCharacter).not.toHaveBeenCalled()
    })

    it('throws WordsmithError when the character is not found', async () => {
      repo.getActiveCharacter.mockReturnValue(null)
      repo.deleteCharacter.mockReturnValue(false)

      await expect(
        cmd.default.execute(makeInteraction('delete', { name: 'Ghost' }))
      ).rejects.toThrow(WordsmithError)
    })
  })

  // ---------------------------------------------------------------------------
  // info
  // ---------------------------------------------------------------------------
  describe('info subcommand', () => {
    it('replies with content showing the active character', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: true })
      repo.getWords.mockReturnValue(['Jump', 'Shoot'])
      repo.getItems.mockReturnValue(['Sword'])

      const interaction = makeInteraction('info')
      await cmd.default.execute(interaction)

      const content = (interaction.reply as ReturnType<typeof vi.fn>).mock.calls[0][0].content
      expect(content).toContain('Aldric')
      expect(content).toContain('Jump')
      expect(content).toContain('Sword')
    })

    it('replies with content when the character has no words or items', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.getWords.mockReturnValue([])
      repo.getItems.mockReturnValue([])

      const interaction = makeInteraction('info')
      await cmd.default.execute(interaction)

      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('Aldric'), flags: MessageFlags.Ephemeral })
      )
    })

    it('replies with a prompt when there is no active character', async () => {
      repo.getActiveCharacter.mockReturnValue(null)

      const interaction = makeInteraction('info')
      await cmd.default.execute(interaction)

      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('/character'),
          flags: MessageFlags.Ephemeral
        })
      )
    })
  })

  // ---------------------------------------------------------------------------
  // word add
  // ---------------------------------------------------------------------------
  describe('word add subcommand', () => {
    it('adds a word to the active character and replies with content', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })

      const interaction = makeInteraction('add', { word: 'Jump' }, 'word')
      await cmd.default.execute(interaction)

      expect(repo.addWord).toHaveBeenCalledWith(1, 'Jump')
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('Jump'), flags: MessageFlags.Ephemeral })
      )
    })

    it('throws WordsmithError when there is no active character', async () => {
      repo.getActiveCharacter.mockReturnValue(null)

      await expect(
        cmd.default.execute(makeInteraction('add', { word: 'Jump' }, 'word'))
      ).rejects.toThrow(WordsmithError)
    })

    it('throws WordsmithError on duplicate word', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.addWord.mockImplementation(() => { throw new Error('UNIQUE constraint failed') })

      await expect(
        cmd.default.execute(makeInteraction('add', { word: 'Jump' }, 'word'))
      ).rejects.toThrow(WordsmithError)
    })
  })

  // ---------------------------------------------------------------------------
  // word delete
  // ---------------------------------------------------------------------------
  describe('word delete subcommand', () => {
    it('removes a word from the active character and replies with content', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.deleteWord.mockReturnValue(true)

      const interaction = makeInteraction('delete', { word: 'Jump' }, 'word')
      await cmd.default.execute(interaction)

      expect(repo.deleteWord).toHaveBeenCalledWith(1, 'Jump')
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('Jump'), flags: MessageFlags.Ephemeral })
      )
    })

    it('throws WordsmithError when there is no active character', async () => {
      repo.getActiveCharacter.mockReturnValue(null)

      await expect(
        cmd.default.execute(makeInteraction('delete', { word: 'Jump' }, 'word'))
      ).rejects.toThrow(WordsmithError)
    })

    it('throws WordsmithError when the word does not exist', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.deleteWord.mockReturnValue(false)

      await expect(
        cmd.default.execute(makeInteraction('delete', { word: 'Ghost' }, 'word'))
      ).rejects.toThrow(WordsmithError)
    })
  })

  // ---------------------------------------------------------------------------
  // item add
  // ---------------------------------------------------------------------------
  describe('item add subcommand', () => {
    it('adds an item to the active character and replies with content', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })

      const interaction = makeInteraction('add', { item: 'Sword' }, 'item')
      await cmd.default.execute(interaction)

      expect(repo.addItem).toHaveBeenCalledWith(1, 'Sword')
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('Sword'), flags: MessageFlags.Ephemeral })
      )
    })

    it('throws WordsmithError when there is no active character', async () => {
      repo.getActiveCharacter.mockReturnValue(null)

      await expect(
        cmd.default.execute(makeInteraction('add', { item: 'Sword' }, 'item'))
      ).rejects.toThrow(WordsmithError)
    })

    it('throws WordsmithError on duplicate item', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.addItem.mockImplementation(() => { throw new Error('UNIQUE constraint failed') })

      await expect(
        cmd.default.execute(makeInteraction('add', { item: 'Sword' }, 'item'))
      ).rejects.toThrow(WordsmithError)
    })
  })

  // ---------------------------------------------------------------------------
  // item delete
  // ---------------------------------------------------------------------------
  describe('item delete subcommand', () => {
    it('removes an item from the active character and replies with content', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.deleteItem.mockReturnValue(true)

      const interaction = makeInteraction('delete', { item: 'Sword' }, 'item')
      await cmd.default.execute(interaction)

      expect(repo.deleteItem).toHaveBeenCalledWith(1, 'Sword')
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ content: expect.stringContaining('Sword'), flags: MessageFlags.Ephemeral })
      )
    })

    it('throws WordsmithError when there is no active character', async () => {
      repo.getActiveCharacter.mockReturnValue(null)

      await expect(
        cmd.default.execute(makeInteraction('delete', { item: 'Sword' }, 'item'))
      ).rejects.toThrow(WordsmithError)
    })

    it('throws WordsmithError when the item does not exist', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.deleteItem.mockReturnValue(false)

      await expect(
        cmd.default.execute(makeInteraction('delete', { item: 'Ghost' }, 'item'))
      ).rejects.toThrow(WordsmithError)
    })
  })

  // ---------------------------------------------------------------------------
  // autocomplete
  // ---------------------------------------------------------------------------
  describe('autocomplete', () => {
    it('returns matching character names for character subcommands', async () => {
      repo.getCharacters.mockReturnValue([
        { name: 'Aldric', star: false },
        { name: 'Mira', star: false }
      ])

      const interaction = makeAutocompleteInteraction('al')
      await cmd.default.autocomplete(interaction)

      expect(interaction.respond).toHaveBeenCalledWith([
        { name: 'Aldric', value: 'Aldric' }
      ])
    })

    it('returns matching words for the word delete subcommand', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.getWords.mockReturnValue(['Jump', 'Shoot', 'Strong'])

      const interaction = makeAutocompleteInteraction('sh', 'word')
      await cmd.default.autocomplete(interaction)

      expect(interaction.respond).toHaveBeenCalledWith([
        { name: 'Shoot', value: 'Shoot' }
      ])
    })

    it('returns empty array for word autocomplete when no active character', async () => {
      repo.getActiveCharacter.mockReturnValue(null)

      const interaction = makeAutocompleteInteraction('j', 'word')
      await cmd.default.autocomplete(interaction)

      expect(interaction.respond).toHaveBeenCalledWith([])
    })

    it('returns matching items for the item delete subcommand', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.getItems.mockReturnValue(['Sword', 'Shield', 'Potion'])

      const interaction = makeAutocompleteInteraction('sw', 'item')
      await cmd.default.autocomplete(interaction)

      expect(interaction.respond).toHaveBeenCalledWith([
        { name: 'Sword', value: 'Sword' }
      ])
    })

    it('returns empty array for item autocomplete when no active character', async () => {
      repo.getActiveCharacter.mockReturnValue(null)

      const interaction = makeAutocompleteInteraction('s', 'item')
      await cmd.default.autocomplete(interaction)

      expect(interaction.respond).toHaveBeenCalledWith([])
    })

    it('is case-insensitive', async () => {
      repo.getCharacters.mockReturnValue([{ name: 'Aldric', star: false }])

      const interaction = makeAutocompleteInteraction('AL')
      await cmd.default.autocomplete(interaction)

      expect(interaction.respond).toHaveBeenCalledWith([
        { name: 'Aldric', value: 'Aldric' }
      ])
    })

    it('returns empty array when nothing matches', async () => {
      repo.getCharacters.mockReturnValue([{ name: 'Mira', star: false }])

      const interaction = makeAutocompleteInteraction('xyz')
      await cmd.default.autocomplete(interaction)

      expect(interaction.respond).toHaveBeenCalledWith([])
    })
  })

  describe('word/item delete dispatch', () => {
    it('dispatches the word delete subcommand', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.deleteWord.mockReturnValue(true)

      const interaction = makeInteraction('delete', { word: 'ancient' }, 'word')
      await cmd.default.execute(interaction)

      expect(repo.deleteWord).toHaveBeenCalledWith(1, 'ancient')
      expect(interaction.reply).toHaveBeenCalled()
    })

    it('dispatches the item delete subcommand', async () => {
      repo.getActiveCharacter.mockReturnValue({ id: 1, name: 'Aldric', star: false })
      repo.deleteItem.mockReturnValue(true)

      const interaction = makeInteraction('delete', { item: 'Sword' }, 'item')
      await cmd.default.execute(interaction)

      expect(repo.deleteItem).toHaveBeenCalledWith(1, 'Sword')
      expect(interaction.reply).toHaveBeenCalled()
    })
  })
})
