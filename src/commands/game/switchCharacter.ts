import {
  SlashCommandBuilder,
  SelectMenuBuilder,
  ActionRowBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getAllCharactersForPlayerInGame } from "../../mongo/helpers";
import { WordsmithError } from "../../classes/wordsmithError";

const commandName = "switch-character";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Switch your active character!"),
  async execute(interaction: CommandInteraction) {
    const sco: SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
    };

    const charactersOwnedByPlayer = await getAllCharactersForPlayerInGame(sco);
    let menuOptions = [] as { label: string; value: string }[];

    if (charactersOwnedByPlayer && charactersOwnedByPlayer.length > 0) {
      menuOptions = charactersOwnedByPlayer?.map((character) => {
        return {
          label: character.name ? character.name : "",
          value: character._id ? character._id.toString() : "",
        };
      });
    }

    if (menuOptions.length < 2) {
      throw new WordsmithError("You do not have two or more characters!");
    }

    const menu = new SelectMenuBuilder()
      .setCustomId("switch-character-menu")
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder("Select your character!")
      .setOptions(menuOptions);

    await interaction.reply({
      components: [
        new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu),
      ],
    });
  },
};
