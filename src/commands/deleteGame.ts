import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { deleteGame } from "../mongo/helpers";

const commandName = "delete-game";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Delete the wordsmith game in this channel."),
  async execute(interaction:CommandInteraction) {

    const discordChannelID = interaction.channelId;
    await deleteGame(discordChannelID);
    await interaction.reply("Game deleted!");

  },
};
