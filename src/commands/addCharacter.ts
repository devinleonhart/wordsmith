import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { createCharacter, findGameByDiscordChannelID } from "../mongo/helpers";

const commandName = "add-character";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Create a new character for this wordsmith channel.")
    .addStringOption(option =>
      option.setName("character-name")
        .setDescription("The name of the character.")
        .setRequired(true))
    .addUserOption(option =>
      option.setName("owner")
        .setDescription("The owner of the character.")
        .setRequired(true)),
  async execute(interaction:CommandInteraction) {

    let cName = "";
    const characterName = interaction.options.get("character-name");
    if(characterName) {
      cName = characterName.value as string;
    }

    const gameID = await findGameByDiscordChannelID(interaction.channelId);

    let ownerID = null;
    const owner = interaction.options.get("owner");
    if(owner) {
      ownerID = owner.user?.id;
    }

    try {
      if(gameID && ownerID) {
        await createCharacter(cName, gameID, ownerID);
        await interaction.reply("Character Created!");
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`Something went wrong with /${commandName}`);
    }
  },
};
