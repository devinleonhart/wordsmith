# Wordsmith Discord Bot

Play Wordsmith in Discord!

## Add your bot to the Discord server.

1. Have the owner of the bot log into the [Developer Dashboard](https://discordapp.com/developers/applications/).
2. Make sure you either own the server or have the "Manage Server" permission for the server that will have the bot as a user.
3. Have the owner of the bot visit OAuth2 section of the Dashboard and generate the OAuth url with the "bot" scope.
4. Visit the URL. Authorize the bot on the server. If you cannot, check your permissions.

### Production

1. Add `NODE_ENV='production'` to the environment.
2. Add `WORDSMITH_SECRET_KEY=XXX` to the environment where `XXX` is the secret key available on the Developer Dashboard under Bot > Build-A-Bot.
3. Use `npm run build` to generate an output build in `./dist`. Run this with node on your server.

### Development

This project uses [dotenv](https://github.com/motdotla/dotenv#readme) for environment variables in development.

1. Create `.env` at the project root.
2. Do not commit this to source. It's in the .gitignore.
3. Add `WORDSMITH_SECRET_KEY=XXX` to `.env` where `XXX` should equal the secret key available on the Developer Dashboard under Bot > Build-A-Bot.

Use `npm run dev` for nodemon.
