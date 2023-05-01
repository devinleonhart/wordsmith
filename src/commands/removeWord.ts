import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { removeWord } from "../mongo/helpers";

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

    const sco:SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
      options: {
        word: interaction.options.get("word")?.value as string
      }
    };

    await removeWord(sco);
    await interaction.reply(`${sco.options?.word} removed!`);

  },
};
