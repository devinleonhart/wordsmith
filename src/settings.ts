import { config } from "dotenv";

if (process.env.NODE_ENV === "development") {
  config();
}

const settings:Settings = {
  clientID: "707732906466082843",
  guildID: "203642332531261441",
  secretKey: process.env.WORDSMITH_SECRET_KEY || "",
  mongoConnectionURI: process.env.NODE_ENV === "development" ? `mongodb://${process.env.DATABASE_HOST}` : `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.DATABASE_HOST}`
};

export default settings;
