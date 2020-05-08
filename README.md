# Wordsmith Discord Bot

It lets you play Wordsmith in Discord!

## Setup Instructions.

## Setup Instructions.

1. Have the owner of the bot log into the [Developer Dashboard](https://discordapp.com/developers/applications/).
2. Make sure you either own the server or have the "Manage Server" permission for the server that will have the bot.
3. Have the owner of the bot visit OAuth2 section of the Dashboard and generate the OAuth url with the "bot" scope.
4. Visit the URL. Authorize the bot on the server. If you cannot, check your permissions.

### Production

1. `process.env.NODE_ENV = 'production'` in this environment.
2. `process.env.DISCORD_SECRET_KEY_WS` should equal the secret key available on the Developer Dashboard under Bot > Build-A-Bot.

### Development

This project uses [dotenv](https://github.com/motdotla/dotenv#readme) for environment variables in development.
`.env` should exist at project root. The key "DISCORD_SECRET_KEY_WS" should equal the secret key available on the Developer Dashboard under Bot > Build-A-Bot.

Use `npm run dev` to start up a new running client locally.

### Testing

`npm run test`
