import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { addStar } from "../mongo/helpers";
import { DiscordEmotes } from "../rules-util";

const commandName = "add-star";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Award a character with a star!"),
  async execute(interaction:CommandInteraction) {

    const sco:SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId
    };

    await addStar(sco);
    await interaction.reply(DiscordEmotes.star);

  },
};
