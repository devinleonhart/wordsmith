import { readdirSync } from "fs";
import { resolve } from "path";
import { Client, Events, Collection, GatewayIntentBits } from "discord.js";
import { setupMongo } from "./mongo";

import settings from "./settings";

(async() => {

  await setupMongo();

  const client = new Client({
    "intents": [GatewayIntentBits.Guilds] // Our bot would like to interact with servers.
  });

  client.commands = new Collection();
  const commandFiles = readdirSync(resolve(__dirname, "./commands"));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
  }

  client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
  });

  client.on("interactionCreate", async interaction => {

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ "content": "There was an error while executing this command!", "ephemeral": true });
    }
  });

  client.login(settings.secretKey);
})();
