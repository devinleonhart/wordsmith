import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { createGame } from "../mongo/helpers";

const commandName = "init-game";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Create a new wordsmith game in this channel."),
  async execute(interaction:CommandInteraction) {

    const discordChannelID = interaction.channelId;

    try {
      await createGame(discordChannelID);
      await interaction.reply("Game Created!");
    } catch (error) {
      console.error(error);
      await interaction.reply(`Something went wrong with /${commandName}`);
    }
  },
};
