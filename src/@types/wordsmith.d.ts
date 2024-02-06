interface Command {
  name: string
  helpText: string
  parameters: string[]
  callback: handlerCallback
}

interface rollOpposedData {
  challengeBlanks: number
  challengeResult: string
  outcome: string
  playerBlanks: number
  playerName: string
  playerResult: string
  reaction: string
}

interface Settings {
  clientID: string
  guildID: string
  secretKey: string
  mongoConnectionURI: string
}

interface WSCharacterData {
  name: string
  star: boolean
  items: string[]
  words: string[]
}

interface SlashCommandOptions {
  playerID: string
  discordChannelID: string
  options?: {
    characterID?: string
    characterName?: string
    item?: string
    user?: string
    word?: string
  }
}

type callback = (value?: string) => void

type handlerCallback = (...args: any) => any
