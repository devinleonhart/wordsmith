import { config } from "dotenv";

const environment = process.env.NODE_ENV;

const settings:Settings = {
  "clientID": "707732906466082843",
  "guildID": "203642332531261441",
  "secretKey": "",
};

if (environment === "production") {
  settings.secretKey = process.env.WORDSMITH_SECRET_KEY || "";
} else if (environment === "development") {
  config();
  settings.secretKey = process.env.WORDSMITH_SECRET_KEY || "";
}

export default settings;
