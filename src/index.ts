import { readdirSync } from "fs";
import { resolve } from "path";
import { Client, Collection, Intents } from "discord.js";

import settings from "./settings";

const client = new Client({
  "intents": [Intents.FLAGS.GUILD_MESSAGES] // Our bot intends to read messages.
});

client.commands = new Collection();
const commandFiles = readdirSync(resolve(__dirname, "./commands"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once("ready", c => {
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
