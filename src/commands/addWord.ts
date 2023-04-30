import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { awardCharacterWord, findCharacterByOwner } from "../mongo/helpers";

const commandName = "add-word";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Add a word to a character.")
    .addStringOption(option =>
      option.setName("word")
        .setDescription("The word you'd like to add.")
        .setRequired(true)),
  async execute(interaction:CommandInteraction) {

    const playerID = interaction.user.id;
    const discordChannelID = interaction.channelId;
    const characterID = await findCharacterByOwner(playerID,discordChannelID);

    let w = "";
    const word = interaction.options.get("word");
    if(word) {
      w = word.value as string;
    }

    if(characterID && w) {
      await awardCharacterWord(characterID, w);
      await interaction.reply(`${w} added!`);
    }

  },
};
