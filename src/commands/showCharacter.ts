import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { findCharacterByOwner, getCharacterData } from "../mongo/helpers";
import { DiscordEmotes } from "../rules-util";

const commandName = "showCharacter";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Show your character!"),
  async execute(interaction:CommandInteraction) {

    const playerID = interaction.user.id;
    const characterID = await findCharacterByOwner(playerID);

    try {
      if(characterID) {
        const characterData = await getCharacterData(characterID);
        if(characterData) {
          await interaction.reply(formatCharacterData(characterData));
        }
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`Something went wrong with /${commandName}`);
    }
  },
};

function formatCharacterData(data: CharacterData):string {
  return `
  ${data.name} ${data.star ? DiscordEmotes.star : ""}
  Items: ${data.items.join(" ")}
  Words: ${data.words.join(" ")}
  `;
}
