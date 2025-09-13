# Testing Guide

This project uses **Vitest** for testing with TypeScript support.

## Test Structure

```
tests/
├── unit/           # Unit tests for individual functions/modules
├── integration/    # Integration tests for Discord bot functionality
└── utils/          # Test utilities and helpers
```

## Running Tests

```bash
# Run tests once
pnpm test:run

# Run tests in watch mode
pnpm test

# Run with coverage
pnpm test:coverage

# Open test UI in browser
pnpm test:ui

# Run tests and watch for changes
pnpm test:watch
```

## Writing Tests

### Unit Tests

Focus on testing individual functions with different inputs:

```typescript
import { describe, it, expect } from 'vitest'
import { RollD20 } from '../../src/rules'

describe('RollD20', () => {
  it('should return validation error for invalid inputs', () => {
    expect(RollD20('Player', 0)).toBe('Error message')
  })
})
```

### Integration Tests

Test Discord bot commands and interactions:

```typescript
import { mockDiscordInteraction, resetMocks } from '../utils/test-helpers'

describe('Discord Commands', () => {
  beforeEach(() => {
    resetMocks()
  })
})
```

## Test Coverage

Generate coverage reports with:
```bash
pnpm test:coverage
```

Coverage reports are generated in `coverage/` directory.

## Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Test edge cases and error conditions**
4. **Keep tests isolated and independent**
5. **Use mocks for external dependencies**
