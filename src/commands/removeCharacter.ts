import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { deleteCharacter, findCharacterByOwner } from "../mongo/helpers";

const commandName = "remove-character";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Remove your character from this wordsmith channel."),
  async execute(interaction:CommandInteraction) {

    const discordChannelID = interaction.channelId;
    const characterID = await findCharacterByOwner(interaction.user.id, discordChannelID)

    if(characterID) {
      await deleteCharacter(characterID, discordChannelID);
      await interaction.reply(`Character deleted!`);
    }

  },
};
