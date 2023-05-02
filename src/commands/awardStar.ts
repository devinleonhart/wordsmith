import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { awardStar } from "../mongo/helpers";
import { DiscordEmotes } from "../rules-util";

const commandName = "award-star";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Award a character with a star!")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user who will get the star!")
        .setRequired(true)),
  async execute(interaction:CommandInteraction) {

    const sco:SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
      options: {
        user: interaction.options.get("user")?.value as string
      }
    };

    await awardStar(sco);
    await interaction.reply(DiscordEmotes.star);

  },
};
