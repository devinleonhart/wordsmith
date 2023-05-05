import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { createGame } from "../../mongo/helpers";

const commandName = "create-game";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Create a new wordsmith game in this channel."),
  async execute(interaction:CommandInteraction) {

    const sco:SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId
    };

    await createGame(sco);
    await interaction.reply("Game created!");

  },
};
