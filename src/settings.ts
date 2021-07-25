import { config } from 'dotenv';

const environment = process.env.NODE_ENV;

const settings:Settings = {
  DISCORD_SECRET_KEY_WS: "",
  prefix: "",
  redisHost: environment === "production" ? "redis" : "127.0.0.1",
  redisPort: 6379,
};

if (environment === "production") {
  settings.DISCORD_SECRET_KEY_WS = process.env.DISCORD_SECRET_KEY_WS || "";
  settings.prefix = "/ws";
} else if (environment === "test") {
  settings.DISCORD_SECRET_KEY_WS = "dummy key";
  settings.prefix = "/ws";
} else if (environment === "development") {
  config();
  settings.DISCORD_SECRET_KEY_WS = process.env.DISCORD_SECRET_KEY_WS || "";
  settings.prefix = "/wtest";
}

export default settings;
