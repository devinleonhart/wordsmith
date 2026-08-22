import { describe, it, expect, beforeEach } from 'vitest'
import { initDb } from '../../src/core/db'
import {
  addItem,
  addWord,
  createCharacter,
  deleteCharacter,
  deleteItem,
  deleteWord,
  getActiveCharacter,
  getCharacters,
  getItems,
  getWords,
  setActiveCharacter,
  setStar
} from '../../src/features/roster/characterRepository'

beforeEach(() => {
  initDb(':memory:')
})

describe('createCharacter', () => {
  it('creates a character and returns it', () => {
    const char = createCharacter('user1', 'Aldric', false)
    expect(char.id).toBeGreaterThan(0)
    expect(char.userId).toBe('user1')
    expect(char.name).toBe('Aldric')
    expect(char.star).toBe(false)
  })

  it('creates a character with star true', () => {
    const char = createCharacter('user1', 'Starborn', true)
    expect(char.star).toBe(true)
  })

  it('allows the same name for different users', () => {
    expect(() => createCharacter('user1', 'Aldric', false)).not.toThrow()
    expect(() => createCharacter('user2', 'Aldric', false)).not.toThrow()
  })

  it('throws on duplicate name for the same user', () => {
    createCharacter('user1', 'Aldric', false)
    expect(() => createCharacter('user1', 'Aldric', true)).toThrow()
  })
})

describe('getCharacters', () => {
  it('returns an empty array for a user with no characters', () => {
    expect(getCharacters('user1')).toEqual([])
  })

  it('returns all characters for the user', () => {
    createCharacter('user1', 'Aldric', false)
    createCharacter('user1', 'Mira', true)
    const chars = getCharacters('user1')
    expect(chars).toHaveLength(2)
    expect(chars.map(c => c.name)).toEqual(['Aldric', 'Mira'])
  })

  it('does not return other users characters', () => {
    createCharacter('user1', 'Aldric', false)
    createCharacter('user2', 'Stranger', false)
    expect(getCharacters('user1')).toHaveLength(1)
    expect(getCharacters('user1')[0].name).toBe('Aldric')
  })

  it('returns characters in insertion order', () => {
    createCharacter('user1', 'Zara', false)
    createCharacter('user1', 'Aldric', false)
    const names = getCharacters('user1').map(c => c.name)
    expect(names).toEqual(['Zara', 'Aldric'])
  })
})

describe('getActiveCharacter', () => {
  it('returns null when the user has no active character', () => {
    expect(getActiveCharacter('user1')).toBeNull()
  })

  it('returns null when the user has characters but none set active', () => {
    createCharacter('user1', 'Aldric', false)
    expect(getActiveCharacter('user1')).toBeNull()
  })

  it('returns the active character after setActiveCharacter', () => {
    const char = createCharacter('user1', 'Aldric', false)
    setActiveCharacter('user1', char.id)
    const active = getActiveCharacter('user1')
    expect(active).not.toBeNull()
    expect(active!.name).toBe('Aldric')
  })

  it('does not return another users active character', () => {
    const char = createCharacter('user2', 'Stranger', false)
    setActiveCharacter('user2', char.id)
    expect(getActiveCharacter('user1')).toBeNull()
  })
})

describe('setActiveCharacter', () => {
  it('sets the active character for a user with no prior settings', () => {
    const char = createCharacter('user1', 'Aldric', false)
    setActiveCharacter('user1', char.id)
    expect(getActiveCharacter('user1')!.id).toBe(char.id)
  })

  it('switches the active character when called again', () => {
    const first = createCharacter('user1', 'Aldric', false)
    const second = createCharacter('user1', 'Mira', true)
    setActiveCharacter('user1', first.id)
    setActiveCharacter('user1', second.id)
    expect(getActiveCharacter('user1')!.id).toBe(second.id)
  })
})

describe('deleteCharacter', () => {
  it('returns true when the character exists and is deleted', () => {
    createCharacter('user1', 'Aldric', false)
    expect(deleteCharacter('user1', 'Aldric')).toBe(true)
  })

  it('returns false when the character does not exist', () => {
    expect(deleteCharacter('user1', 'Ghost')).toBe(false)
  })

  it('does not delete another users character with the same name', () => {
    createCharacter('user2', 'Aldric', false)
    expect(deleteCharacter('user1', 'Aldric')).toBe(false)
    expect(getCharacters('user2')).toHaveLength(1)
  })

  it('removes the character from the roster', () => {
    createCharacter('user1', 'Aldric', false)
    deleteCharacter('user1', 'Aldric')
    expect(getCharacters('user1')).toHaveLength(0)
  })

  it('clears active_character_id when the active character is deleted', () => {
    const char = createCharacter('user1', 'Aldric', false)
    setActiveCharacter('user1', char.id)
    deleteCharacter('user1', 'Aldric')
    expect(getActiveCharacter('user1')).toBeNull()
  })

  it('cascades deletion to the characters words', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addWord(char.id, 'Jump')
    deleteCharacter('user1', 'Aldric')
    expect(getWords(char.id)).toEqual([])
  })
})

describe('addWord', () => {
  it('adds a word to a character', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addWord(char.id, 'Jump')
    expect(getWords(char.id)).toEqual(['Jump'])
  })

  it('allows multiple words on the same character', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addWord(char.id, 'Jump')
    addWord(char.id, 'Shoot')
    expect(getWords(char.id)).toEqual(['Jump', 'Shoot'])
  })

  it('throws on duplicate word for the same character', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addWord(char.id, 'Jump')
    expect(() => addWord(char.id, 'Jump')).toThrow()
  })

  it('allows the same word on different characters', () => {
    const a = createCharacter('user1', 'Aldric', false)
    const b = createCharacter('user1', 'Mira', false)
    expect(() => { addWord(a.id, 'Jump'); addWord(b.id, 'Jump') }).not.toThrow()
  })
})

describe('deleteWord', () => {
  it('returns true when the word exists and is deleted', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addWord(char.id, 'Jump')
    expect(deleteWord(char.id, 'Jump')).toBe(true)
  })

  it('returns false when the word does not exist', () => {
    const char = createCharacter('user1', 'Aldric', false)
    expect(deleteWord(char.id, 'Ghost')).toBe(false)
  })

  it('removes the word from the list', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addWord(char.id, 'Jump')
    addWord(char.id, 'Shoot')
    deleteWord(char.id, 'Jump')
    expect(getWords(char.id)).toEqual(['Shoot'])
  })
})

describe('getWords', () => {
  it('returns an empty array when the character has no words', () => {
    const char = createCharacter('user1', 'Aldric', false)
    expect(getWords(char.id)).toEqual([])
  })

  it('returns words in insertion order', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addWord(char.id, 'Strong')
    addWord(char.id, 'Jump')
    addWord(char.id, 'Shoot')
    expect(getWords(char.id)).toEqual(['Strong', 'Jump', 'Shoot'])
  })
})

describe('setStar', () => {
  it('sets star to true on a character', () => {
    const char = createCharacter('user1', 'Aldric', false)
    setStar(char.id, true)
    expect(getCharacters('user1')[0].star).toBe(true)
  })

  it('sets star to false on a character', () => {
    const char = createCharacter('user1', 'Aldric', false)
    setStar(char.id, true)
    setStar(char.id, false)
    expect(getCharacters('user1')[0].star).toBe(false)
  })

  it('does not affect other characters', () => {
    const a = createCharacter('user1', 'Aldric', false)
    const b = createCharacter('user1', 'Mira', false)
    setStar(a.id, true)
    expect(getCharacters('user1')[1].star).toBe(false)
    expect(b.id).toBeGreaterThan(0) // suppress unused var warning
  })
})

describe('addItem', () => {
  it('adds an item to a character', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addItem(char.id, 'Sword')
    expect(getItems(char.id)).toEqual(['Sword'])
  })

  it('allows multiple items on the same character', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addItem(char.id, 'Sword')
    addItem(char.id, 'Shield')
    expect(getItems(char.id)).toEqual(['Sword', 'Shield'])
  })

  it('throws on duplicate item for the same character', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addItem(char.id, 'Sword')
    expect(() => addItem(char.id, 'Sword')).toThrow()
  })

  it('allows the same item on different characters', () => {
    const a = createCharacter('user1', 'Aldric', false)
    const b = createCharacter('user1', 'Mira', false)
    expect(() => { addItem(a.id, 'Sword'); addItem(b.id, 'Sword') }).not.toThrow()
  })
})

describe('deleteItem', () => {
  it('returns true when the item exists and is deleted', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addItem(char.id, 'Sword')
    expect(deleteItem(char.id, 'Sword')).toBe(true)
  })

  it('returns false when the item does not exist', () => {
    const char = createCharacter('user1', 'Aldric', false)
    expect(deleteItem(char.id, 'Ghost')).toBe(false)
  })

  it('removes the item from the list', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addItem(char.id, 'Sword')
    addItem(char.id, 'Shield')
    deleteItem(char.id, 'Sword')
    expect(getItems(char.id)).toEqual(['Shield'])
  })
})

describe('getItems', () => {
  it('returns an empty array when the character has no items', () => {
    const char = createCharacter('user1', 'Aldric', false)
    expect(getItems(char.id)).toEqual([])
  })

  it('returns items in insertion order', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addItem(char.id, 'Armor')
    addItem(char.id, 'Sword')
    addItem(char.id, 'Potion')
    expect(getItems(char.id)).toEqual(['Armor', 'Sword', 'Potion'])
  })

  it('cascades deletion to the characters items', () => {
    const char = createCharacter('user1', 'Aldric', false)
    addItem(char.id, 'Sword')
    deleteCharacter('user1', 'Aldric')
    expect(getItems(char.id)).toEqual([])
  })
})
