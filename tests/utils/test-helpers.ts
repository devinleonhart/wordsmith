export const mockDiscordInteraction = {
  reply: vi.fn(),
  options: {
    get: vi.fn()
  },
  member: {
    user: {
      username: 'TestUser'
    }
  },
  commandName: 'test'
}

export const resetMocks = () => {
  vi.clearAllMocks()
}

export const mockClient = {
  commands: new Map(),
  selectMenus: new Map(),
  handleEvents: vi.fn(),
  handleCommands: vi.fn(),
  login: vi.fn()
}
