interface Command {
  name: string,
  helpText: string,
  parameters: string[],
  callback: handlerCallback,
}

interface rollOpposedData {
  challengeBlanks: number,
  challengeResult: string,
  explanation: string,
  outcome: string,
  playerBlanks: number,
  playerName: string,
  playerResult: string,
  reaction: string,
}

interface Settings {
  clientID: string
  guildID: string
  secretKey: string,
  mongoConnectionURI: string,
}

interface CharacterData {
  name: string;
  star: boolean;
  items: string[];
  words: string[];
}

type callback = (value?: string) => void;

type handlerCallback = (...args: any) => any;
