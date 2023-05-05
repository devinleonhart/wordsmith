const { REST, Routes } = require("discord.js");
import settings from "./settings";
import { readdirSync } from "fs";
import { resolve } from "path";

const commands = [];
const commandFiles = readdirSync(resolve(__dirname, "./commands"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(settings.secretKey);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(settings.clientID, settings.guildID),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
