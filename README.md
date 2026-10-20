# Wordsmith Discord Bot

A Discord bot for the Wordsmith tabletop game. It rolls Wordsmith dice, keeps a roster of each player's characters, and looks up Pokémon data from [PokéAPI](https://pokeapi.co/).

## Commands

**Dice**

- `/d20`: make a d20 roll against a target number.
- `/r`: make a roll.
- `/ro`: make an opposed roll.
- `/rr`: request that a character roll dice.
- `/ror`: request that a character make an opposed roll.

**Roster**

- `/character`: create, list, switch, delete and view your characters, and manage their words and items.
- `/star`: grant a star to a user's active character.
- `/unstar`: spend a star from a user's active character.

**Pokédex**

- `/pokemon`: get a Pokémon's types.
- `/move`: look up a move.
- `/effectiveness`: how effective an attack type is against a Pokémon.
- `/typecheck`: how effective an attack type is against one or two defending types.

## Setup

Requires Node and pnpm at the versions in `.tool-versions`.

1. Create a bot in the [Discord Developer Portal](https://discord.com/developers/applications/) and add it to your server with the `bot` and `applications.commands` scopes.
2. Copy `.env.example` to `.env` and set `WORDSMITH_SECRET_KEY` to the bot token. Set `WORDSMITH_CLIENT_ID` and `WORDSMITH_GUILD_ID` too, unless you're running the main Wordsmith app.
3. Create the database directory: `mkdir data`.

Slash commands are registered to the guild on startup.

## Development

```bash
pnpm install
pnpm dev           # run with tsx, restarting on changes
pnpm quality       # typecheck, lint, format check, tests
pnpm format        # format with Prettier
pnpm lint:fix      # fix lint problems
pnpm quality:ci    # same, with the coverage gate CI uses
```

Run any dice or Pokédex command in the terminal without Discord:

```bash
pnpm cmd --list
pnpm cmd d20 --target-number 12
pnpm cmd effectiveness --attack_type water --pokemon charizard
```

`pnpm register` re-syncs slash commands if the sync at startup failed.

To run the dev server in Docker instead: `docker compose up` (uses `Dockerfile.dev` and your `.env`).

See [tests/README.md](tests/README.md) for testing.

## Deployment

Every push to `master` runs CI (`.github/workflows/ci.yml`). If the checks pass, CI builds the production image and pushes it to DockerHub as `devleo/wordsmith:latest` and `devleo/wordsmith:sha-<commit>`. Deploying to the server is a separate manual step: pull the new image there and restart the container.

To run the production image yourself:

```bash
docker build -t wordsmith .
docker run -d --env-file .env -v wordsmith_data:/app/data wordsmith
```
