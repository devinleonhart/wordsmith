import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { findCharacterByOwner, removeCharacterItem } from "../mongo/helpers";

const commandName = "remove-item";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Remove an item from a character.")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("The item you'd like to remove.")
        .setRequired(true)),
  async execute(interaction:CommandInteraction) {

    const playerID = interaction.user.id;
    const discordChannelID = interaction.channelId;
    const characterID = await findCharacterByOwner(playerID, discordChannelID);

    let i = "";
    const item = interaction.options.get("item");
    if(item) {
      i = item.value as string;
    }

    try {
      if(characterID && i) {
        await removeCharacterItem(characterID, i);
        await interaction.reply(`${i} removed!`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`Something went wrong with /${commandName}`);
    }
  },
};
