import { describe, it, expect } from 'vitest'
import { WordsmithError } from '../../src/classes/wordsmithError'

describe('WordsmithError', () => {
  it('should create error with message', () => {
    const message = 'Test error message'
    const error = new WordsmithError(message)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(WordsmithError)
    expect(error.message).toBe(message)
    expect(error.name).toBe('WordsmithError')
  })

  it('should create error without message', () => {
    const error = new WordsmithError()

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('')
    expect(error.name).toBe('WordsmithError')
  })

  it('should have correct stack trace', () => {
    const error = new WordsmithError('Stack test')

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('WordsmithError')
  })
})
