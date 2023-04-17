import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { findCharacterByOwner, removeCharacterItem } from "../mongo/helpers";

const commandName = "removeItem";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Add a item to a character.")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("The item you'd like to add.")
        .setRequired(true)),
  async execute(interaction:CommandInteraction) {

    const playerID = interaction.user.id;
    const characterID = await findCharacterByOwner(playerID);

    let i = "";
    const item = interaction.options.get("item");
    if(item) {
      i = item.value as string;
    }

    try {
      if(characterID && i) {
        await removeCharacterItem(characterID, i);
        await interaction.reply("Item removed!");
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`Something went wrong with /${commandName}`);
    }
  },
};
