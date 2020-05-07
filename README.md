# Wordsmith Discord Bot

It lets you play Wordsmith in Discord!

## Setup Instructions.

1. Have the owner of the bot log into the [Developer Dashboard](https://discordapp.com/developers/applications/).
2. Make sure you either own the server or have the "Manage Server" permission for the server that will have the bot.
3. Have the owner of the bot visit OAuth2 section of the Dashboard and generate the OAuth url with the "bot" scope.
4. Visit the URL. Authorize the bot on the server. If you cannot, check your permissions.

### Production

1. `process.env.NODE_ENV = 'production'` in this environment.
2. `process.env.WORDSMITH_PROD_KEY` should equal the secret key available on the Developer Dashboard.

### Development

`/development-secrets.json` should exist at project route. The key "bot_secret" should equal the secret key available on the Developer Dashboard.
