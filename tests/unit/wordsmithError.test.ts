import { describe, it, expect } from 'vitest'
import { WordsmithError } from '../../src/classes/wordsmithError'

describe('WordsmithError', () => {
  it('should create error with message', () => {
    const error = new WordsmithError('Test error message')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(WordsmithError)
    expect(error.message).toBe('Test error message')
    expect(error.name).toBe('WordsmithError')
  })

  it('should create error with empty message', () => {
    const error = new WordsmithError('')

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('')
    expect(error.name).toBe('WordsmithError')
  })

  it('should have a stack trace containing the class name', () => {
    const error = new WordsmithError('Stack test')

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('WordsmithError')
  })

  it('should be catchable as a plain Error', () => {
    expect(() => {
      throw new WordsmithError('thrown')
    }).toThrow(Error)
  })

  it('should be catchable as a WordsmithError', () => {
    expect(() => {
      throw new WordsmithError('thrown')
    }).toThrow(WordsmithError)
  })

  it('should preserve message when caught', () => {
    try {
      throw new WordsmithError('caught message')
    } catch (e) {
      expect(e).toBeInstanceOf(WordsmithError)
      expect((e as WordsmithError).message).toBe('caught message')
      expect((e as WordsmithError).name).toBe('WordsmithError')
    }
  })
})
