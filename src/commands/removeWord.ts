import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { findCharacterByOwner, removeCharacterWord } from "../mongo/helpers";

const commandName = "remove-word";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Remove a word from a character.")
    .addStringOption(option =>
      option.setName("word")
        .setDescription("The word you'd like to remove.")
        .setRequired(true)),
  async execute(interaction:CommandInteraction) {

    const playerID = interaction.user.id;
    const discordChannelID = interaction.channelId;
    const characterID = await findCharacterByOwner(playerID, discordChannelID);

    let w = "";
    const word = interaction.options.get("word");
    if(word) {
      w = word.value as string;
    }

    try {
      if(characterID && w) {
        await removeCharacterWord(characterID, w);
        await interaction.reply(`${w} removed!`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`Something went wrong with /${commandName}`);
    }
  },
};
