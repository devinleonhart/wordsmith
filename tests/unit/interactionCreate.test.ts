import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MessageFlags } from 'discord.js'
import { WordsmithError } from '../../src/core/errors'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let handler: any

const makeInteraction = (overrides = {}) => ({
  isAutocomplete: () => false,
  isChatInputCommand: () => true,
  commandName: 'test',
  replied: false,
  deferred: false,
  reply: vi.fn(),
  followUp: vi.fn(),
  ...overrides
})

const makeClient = (command: unknown) => ({
  commands: { get: vi.fn(() => command) }
})

describe('interactionCreate handler', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    handler = (await import('../../src/events/interactionCreate')).default
  })

  it('surfaces a WordsmithError message as an ephemeral reply', async () => {
    const command = { execute: vi.fn(async () => { throw new WordsmithError('nope') }) }
    const interaction = makeInteraction()
    await handler.execute(interaction, makeClient(command))

    expect(interaction.reply).toHaveBeenCalledWith({
      content: 'nope',
      flags: MessageFlags.Ephemeral
    })
  })

  it('replies with a generic message and logs on an unexpected error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const command = { execute: vi.fn(async () => { throw new Error('boom') }) }
    const interaction = makeInteraction()
    await handler.execute(interaction, makeClient(command))

    expect(errorSpy).toHaveBeenCalled()
    expect(interaction.reply).toHaveBeenCalledWith({
      content: expect.stringContaining('Something went wrong'),
      flags: MessageFlags.Ephemeral
    })
    errorSpy.mockRestore()
  })

  it('uses followUp when the interaction was already deferred', async () => {
    const command = { execute: vi.fn(async () => { throw new WordsmithError('later') }) }
    const interaction = makeInteraction({ deferred: true })
    await handler.execute(interaction, makeClient(command))

    expect(interaction.followUp).toHaveBeenCalledWith({
      content: 'later',
      flags: MessageFlags.Ephemeral
    })
    expect(interaction.reply).not.toHaveBeenCalled()
  })

  it('does not throw if sending the error response itself fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const command = { execute: vi.fn(async () => { throw new WordsmithError('x') }) }
    const interaction = makeInteraction({
      reply: vi.fn(async () => { throw new Error('reply failed') })
    })
    await expect(handler.execute(interaction, makeClient(command))).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('ignores chat-input commands that are not registered', async () => {
    const interaction = makeInteraction()
    await handler.execute(interaction, makeClient(undefined))
    expect(interaction.reply).not.toHaveBeenCalled()
  })

  it('routes autocomplete interactions to the command autocomplete handler', async () => {
    const autocomplete = vi.fn()
    const command = { autocomplete }
    const interaction = makeInteraction({
      isAutocomplete: () => true,
      isChatInputCommand: () => false
    })
    await handler.execute(interaction, makeClient(command))
    expect(autocomplete).toHaveBeenCalledWith(interaction)
  })
})
