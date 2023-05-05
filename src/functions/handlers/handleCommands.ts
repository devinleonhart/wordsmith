import { readdirSync } from "fs";
import { resolve } from "path";
import { Client } from "discord.js";
const { REST, Routes } = require("discord.js");
import settings from "../../settings";

module.exports = (client: Client) => {
  client.handleCommands = async () => {
    const commandFolders = readdirSync(resolve(__dirname, "../../commands"));
    for (const folder of commandFolders) {
      const commandFiles = readdirSync(
        resolve(__dirname, `../../commands/${folder}`)
      );

      for (const file of commandFiles) {
        const command = require(resolve(
          __dirname,
          `../../commands/${folder}/${file}`
        ));
        client.commands.set(command.data.name, command);
      }
    }

    // Publish
    const commands = [];
    const commandFiles = readdirSync(resolve(__dirname, "../../commands/game"));

    for (const file of commandFiles) {
      const command = require(`../../commands/game/${file}`);
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
  };
};
