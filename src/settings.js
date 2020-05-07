const environment = process.env.NODE_ENV;

const settings = {
  // when debugging, use a different prefix to avoid conflicting with the
  // production instance of Wordsmith
  prefix: "/ws",
};

if (environment === "production") {
  settings.token = process.env.WORDSMITH_PROD_KEY;
} else if (environment === "test") {
  settings.token = "dummy token";
} else {
  const secrets = require("../development-secrets");
  settings.token = secrets.bot_secret;
}

module.exports = settings;
