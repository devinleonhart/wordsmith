# Wordsmith

A Discord bot for the Wordsmith tabletop game. It rolls Wordsmith dice, keeps a roster of each player's characters, and looks up Pokémon data from [PokéAPI](https://pokeapi.co/).

## Features

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

## Development

Needs Node and pnpm at the versions in `.tool-versions`.

1. Create a bot in the [Discord Developer Portal](https://discord.com/developers/applications/) and add it to your server with the `bot` and `applications.commands` scopes.
2. Copy `.env.example` to `.env` and set the variables below.
3. Create the database directory: `mkdir data`.

```bash
pnpm install
pnpm dev           # runs with tsx, restarting on changes
pnpm quality       # type check, lint, format check and tests
pnpm quality:ci    # the same with the coverage gate: everything CI checks
pnpm format        # formats with Prettier
pnpm lint:fix      # fixes lint problems
docker compose up  # the same in a container, from Dockerfile.dev
```

Any dice or Pokédex command runs in the terminal without Discord:

```bash
pnpm cmd --list
pnpm cmd d20 --target-number 12
pnpm cmd effectiveness --attack_type water --pokemon charizard
```

Slash commands are registered to the guild on startup; `pnpm register` registers them again if that failed. See [tests/README.md](tests/README.md) for testing.

## Environment

| Variable | Purpose |
|---|---|
| `WORDSMITH_SECRET_KEY` | The bot's token |
| `WORDSMITH_CLIENT_ID`, `WORDSMITH_GUILD_ID` | The application and the server; default to the Wordsmith application and its server |
| `DATABASE_PATH` | The SQLite file (default `./data/wordsmith.db`), which should be on a volume |

## Deployment

A merge to `master` runs CI, which publishes `devleo/wordsmith:latest` to Docker Hub when the checks pass. On the server:

```bash
docker compose pull wordsmith-bot
docker compose up -d wordsmith-bot
```

## Architecture

```
src/features/    # One folder for each group of commands
src/core/        # The database and what the features share
src/registry.ts  # The list of commands
src/register.ts  # Registers the commands with Discord
```
