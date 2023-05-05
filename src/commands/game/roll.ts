import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

import { roll } from "../../rules";

const commandName = "r";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Make a roll in wordsmith.")
    .addIntegerOption(option =>
      option.setName("player-dice")
        .setDescription("The number of player dice being rolled.")
        .setRequired(true)),
  async execute(interaction:CommandInteraction) {

    let name = "";
    if(interaction.member) {
      name = interaction.member.user.username;
    }

    let pdice = 0;
    const pdiceOption = interaction.options.get("player-dice");
    if(pdiceOption) {
      pdice = pdiceOption.value as number;
    }

    const result = roll(name, pdice);
    await interaction.reply(result);

  },
};
