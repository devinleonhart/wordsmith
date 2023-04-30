import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { findCharacterByOwner, getCharacterData } from "../mongo/helpers";
import { DiscordEmotes } from "../rules-util";

const commandName = "show";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Show your character!"),
  async execute(interaction:CommandInteraction) {

  const playerID = interaction.user.id;
  const discordChannelID = interaction.channelId;
  const characterID = await findCharacterByOwner(playerID, discordChannelID);

    if(characterID) {
      const characterData = await getCharacterData(characterID);
      if(characterData) {
        await interaction.reply(formatCharacterData(characterData));
      }
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
