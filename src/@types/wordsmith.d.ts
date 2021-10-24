interface Command {
  name: string,
  helpText: string,
  parameters: string[],
  callback: handlerCallback,
}

interface Settings {
  clientID: string
  guildID: string
  secretKey: string,
}

type callback = (value?: string) => void;

type handlerCallback = (...args: any) => any;
