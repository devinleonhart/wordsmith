import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { addCharacter } from "../mongo/helpers";

const commandName = "add-character";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Create a new character for this wordsmith channel.")
    .addStringOption(option =>
      option.setName("character-name")
        .setDescription("The name of the character.")
        .setRequired(true)),
  async execute(interaction:CommandInteraction) {

    const sco:SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
      options: {
        characterName: interaction.options.get("character-name")?.value as string
      }
    };

    await addCharacter(sco);
    await interaction.reply(`${sco.options?.characterName} created!`);

  },
};
