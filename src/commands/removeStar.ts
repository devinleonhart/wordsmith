import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { useCharacterStar, findCharacterByOwner } from "../mongo/helpers";
import { DiscordEmotes } from "../rules-util";

const commandName = "remove-star";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Spend a character's star!"),
  async execute(interaction:CommandInteraction) {

    const playerID = interaction.user.id;
    const discordChannelID = interaction.channelId;
    const characterID = await findCharacterByOwner(playerID, discordChannelID);

    if(characterID) {
      await useCharacterStar(characterID);
      await interaction.reply(DiscordEmotes.smirkingCatWithBeer);
    }

  },
};
