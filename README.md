# Wordsmith Discord Bot

A Discord bot for playing Wordsmith dice games.

## Setup

1. Get a Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications/)
2. Copy `.env.example` to `.env` and add your bot token
3. Add bot to your Discord server with "bot" scope

## Development

**Docker Compose**
```bash
docker compose up -d
docker compose logs -f
docker compose down
```

**Local Development**
```bash
pnpm install
pnpm dev
```

## Production

**Docker**
```bash
docker build -t wordsmith-bot .
docker run -d --env-file .env wordsmith-bot
```

**Manual**
```bash
pnpm build
NODE_ENV=production pnpm start
```
