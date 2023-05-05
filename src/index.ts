import { readdirSync } from "fs";
import { resolve } from "path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { setupMongo } from "./mongo";
import settings from "./settings";

(async () => {
  await setupMongo();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds], // Our bot would like to interact with servers.
  });

  client.commands = new Collection();

  const functionFolders = readdirSync(resolve(__dirname, "./functions"));
  for (const folder of functionFolders) {
    const functionFiles = readdirSync(
      resolve(__dirname, `./functions/${folder}`)
    );
    for (const file of functionFiles) {
      require(`./functions/${folder}/${file}`)(client);
    }
  }

  client.handleEvents();
  client.handleCommands();
  client.login(settings.secretKey);
})();
