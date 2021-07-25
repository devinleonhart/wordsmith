type callback = (value?: string) => void;

type handlerCallback = (...args: any) => any;

interface Command {
  name: string,
  helpText: string,
  parameters: string[],
  callback: handlerCallback,
}

interface Settings {
  DISCORD_SECRET_KEY_WS: string,
  prefix: string,
  redisHost: string,
  redisPort: number,
}
