import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { removeStar } from "../mongo/helpers";
import { DiscordEmotes } from "../rules-util";

const commandName = "remove-star";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Spend a character's star!"),
  async execute(interaction:CommandInteraction) {

    const sco:SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId
    };

    await removeStar(sco);
    await interaction.reply(DiscordEmotes.smirkingCatWithBeer);
  },
};
