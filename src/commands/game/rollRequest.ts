import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

import { rollRequest } from "../../rules";

const commandName = "rr";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Request that a character roll dice.")
    .addStringOption((option) =>
      option
        .setName("character-name")
        .setDescription("The name of the character that must roll dice.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("player-dice")
        .setDescription("The number of player dice to roll.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    let cname = "";
    const cnameOption = interaction.options.get("character-name");
    if (cnameOption) {
      cname = cnameOption.value as string;
    }

    let pdice = 0;
    const pdiceOption = interaction.options.get("player-dice");
    if (pdiceOption) {
      pdice = pdiceOption.value as number;
    }

    const result = rollRequest(cname, pdice);
    await interaction.reply(result);
  },
};
