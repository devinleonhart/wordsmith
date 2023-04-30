import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { awardCharacterStar, findCharacterByOwner } from "../mongo/helpers";
import { DiscordEmotes } from "../rules-util";

const commandName = "add-star";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Award a character with a star!"),
  async execute(interaction:CommandInteraction) {

    const playerID = interaction.user.id;
    const discordChannelID = interaction.channelId;
    const characterID = await findCharacterByOwner(playerID, discordChannelID);

    if(characterID) {
      await awardCharacterStar(characterID);
      await interaction.reply(DiscordEmotes.star);
    }

  },
};
