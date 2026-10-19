# Wordsmith

Discord bot (discord.js 14, TypeScript, CommonJS) with three feature areas: Wordsmith dice rolls, a character roster stored in SQLite, and Pokédex lookups through PokéAPI (`pokenode-ts`). It serves one guild with guild-scoped slash commands (12 as of 2026-10-19).

## Commands

- `pnpm quality:ci`: what CI runs (typecheck, lint, tests with the coverage gate). Run it before merging.
- `pnpm test` runs once (not watch mode). Use `pnpm test:watch` for watch mode.
- `pnpm dev`: nodemon + ts-node on `src/index.ts`. Needs `.env` (see Local dev).
- `pnpm cmd <command> --<option> <value>` runs a command in the terminal without Discord. `pnpm cmd --list` shows options. Works for the dice and Pokédex commands. Roster commands (`character`, `star`, `unstar`) fail: the harness has no subcommand support and never opens the database.
- `pnpm register` re-syncs slash commands to the guild. Boot also does this, so it's only needed if the boot-time sync failed.

## Layout

- `src/features/<area>/commands/*.ts`: one slash command per file, default-exporting a `BotCommand` (`src/core/command.ts`).
- `src/registry.ts`: the explicit list of commands and events. A new command must be added here or it won't register.
- `src/bootstrap.ts`: config check, DB init, event wiring, command sync, login, shutdown.
- `src/events/interactionCreate.ts`: dispatches commands. Uncaught errors become an ephemeral reply. Throw `WordsmithError` (`src/core/errors.ts`) for messages meant for users. Other errors get a generic message and are logged.
- `src/core/db.ts`: better-sqlite3 with migrations keyed on `PRAGMA user_version`. Add migrations as new `if (version < N)` blocks.
- `tests/unit`, `tests/integration`: Vitest. Command tests mock the interaction object and the PokéAPI client, so nothing hits Discord or the network.

## Conventions

- Commands that call PokéAPI call `deferReply()` before their `try` block, then use `editReply()`. If `deferReply()` is inside the `try`, a failed defer makes the `catch` throw a second time.
- Coverage thresholds are top-level keys under `coverage.thresholds` in `vitest.config.mts`. Vitest ignores a nested `global:` key.
- Node and pnpm versions are pinned in `.tool-versions`, `package.json` (`packageManager`), `Dockerfile` and `Dockerfile.dev`. CI fails if they disagree. Dependabot bumps the Docker Node image but not `.tool-versions`, so its base-image PRs need a one-line `.tool-versions` bump before they pass.
- `pnpm-workspace.yaml` holds TypeScript on 6.x until typescript-eslint supports TS 7, and pins patched versions of some transitive dependencies. Read its comments before removing an override.

## Local dev

- Create `.env` from `.env.example` and make a `data/` directory. Startup fails if `data/` is missing. Both are gitignored.
- With no `WORDSMITH_CLIENT_ID` or `WORDSMITH_GUILD_ID` set, the bot uses the production app and guild IDs. The only token is the production one (in `/srv/lucky/.env` on `lucky`). Running `pnpm dev` with it while production is up starts a second copy of the bot. Both race to answer each command, and the loser logs "Interaction has already been acknowledged."
- `docker compose up` (`Dockerfile.dev`) probably fails: it lacks the `python3 make g++` that better-sqlite3 needs to compile on Alpine. Unverified.

## CI and deploy

- `.github/workflows/ci.yml`: every push and PR to `master` runs the version check, `pnpm audit --prod`, and `pnpm quality:ci`. On a push to `master` it also builds the image and pushes `devleo/wordsmith:latest` (the only tag). CI does not deploy.
- The workflow cancels older runs when a newer push lands, so only the newest commit's image should reach DockerHub. When merging several commits, check that the newest run is the one that pushed.
- Work goes straight to `master`. No PRs except Dependabot's.
- Deploy is manual, on the `lucky` server:
  ```bash
  ssh lucky
  cd /srv/lucky
  docker compose pull wordsmith-bot
  docker compose up -d wordsmith-bot
  ```
- Verify: `docker ps --filter name=wordsmith` shows the container `Up`. `docker logs --tail 25 wordsmith` shows `Successfully reloaded 12 application (/) commands.` and `Ready! Logged in as Wordsmith#3254!`.
- On `lucky`, the compose project is `developer`. The service is `wordsmith-bot`, the container is `wordsmith`, the network is `developer_wordsmith_network`, and the SQLite volume is `developer_wordsmith_data`, mounted at `/app/data`.
- A change that only touches tests, CI or docs still builds a new image, but there's nothing new to deploy.
