import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { awardStar } from "../mongo/helpers";
import { DiscordEmotes } from "../rules-util";

const commandName = "award-star";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Award a character with a star!"),
  async execute(interaction:CommandInteraction) {

    const sco:SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId
    };

    await awardStar(sco);
    await interaction.reply(DiscordEmotes.star);

  },
};
