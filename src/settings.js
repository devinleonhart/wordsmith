const environment = process.env.NODE_ENV;

const settings = {
  prefix: "/ws",
};

if (environment === "production") {
  settings.DISCORD_SECRET_KEY_WS = process.env.DISCORD_SECRET_KEY_WS;
} else if (environment === "test") {
  settings.DISCORD_SECRET_KEY_WS = "dummy key";
} else if (environment === "development") {
  require("dotenv").config();
  settings.DISCORD_SECRET_KEY_WS = process.env.DISCORD_SECRET_KEY_WS;
}

module.exports = settings;
