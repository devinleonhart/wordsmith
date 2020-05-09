const environment = process.env.NODE_ENV;

const settings = {};

if (environment === "production") {
  settings.DISCORD_SECRET_KEY_WS = process.env.DISCORD_SECRET_KEY_WS;
  settings.prefix = "/ws";
} else if (environment === "test") {
  settings.DISCORD_SECRET_KEY_WS = "dummy key";
  settings.prefix = "/ws";
} else if (environment === "development") {
  require("dotenv").config();
  settings.DISCORD_SECRET_KEY_WS = process.env.DISCORD_SECRET_KEY_WS;
  settings.prefix = "/wst";
}

module.exports = settings;
