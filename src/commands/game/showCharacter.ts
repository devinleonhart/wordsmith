import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getCharacterData } from "../../mongo/helpers";
import { DiscordEmotes } from "../../rules-util";

const commandName = "show-character";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Show your character!"),
  async execute(interaction:CommandInteraction) {


    const sco:SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId
    };

    const characterData = await getCharacterData(sco);
    await interaction.reply(formatCharacterData(characterData));
  },
};

function formatCharacterData(data: CharacterData | undefined):string {
  return `
  ${data?.name} ${data?.star ? DiscordEmotes.star : ""}
  Items: ${data?.items.join(" | ")}
  Words: ${data?.words.join(" | ")}
  `;
}
