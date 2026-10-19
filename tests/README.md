# Testing Guide

Tests use [Vitest](https://vitest.dev/). Nothing talks to Discord or PokéAPI: command tests build a mock interaction and mock the PokéAPI client.

## Layout

```
tests/
├── unit/          # pure logic: dice rules, type chart, database, settings, error handling
└── integration/   # one file per slash command, run against a mock interaction
```

## Running tests

```bash
pnpm test              # run once
pnpm test:watch        # re-run on changes
pnpm test:coverage     # run once with a coverage report in coverage/
pnpm test:ui           # browser UI
pnpm quality:ci        # typecheck + lint + tests with the coverage gate, as CI runs it
```

The coverage gate lives in `vitest.config.mts` under `coverage.thresholds`. The keys go directly under `thresholds`: Vitest silently ignores a nested `global:` block.

## Writing a command test

Mock the interaction inline with only the methods the command calls, and mock external clients with `vi.mock` before importing the command:

```typescript
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

  it('replies with the Pokémon types', async () => {
    interaction.options.getString.mockReturnValue('charizard')
    mockGetPokemonByName.mockResolvedValue({
      name: 'charizard',
      types: [{ type: { name: 'fire' } }, { type: { name: 'flying' } }]
    })
    await cmd.default.execute(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith('**Charizard** is a fire, flying type Pokémon.')
  })
})
```

Database tests call `initDb(':memory:')` from `src/core/db.ts` so each test gets a fresh SQLite database.
