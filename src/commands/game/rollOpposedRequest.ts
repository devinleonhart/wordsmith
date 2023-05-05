import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

import { rollOpposedRequest } from "../../rules";

const commandName = "ror";

module.exports = {
  "data": new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Request that a character make an opposed roll.")
    .addStringOption(option =>
      option.setName("character-name")
        .setDescription("The name of the character that must roll dice.")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("player-dice")
        .setDescription("The number of player dice to roll.")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("challenge-dice")
        .setDescription("The number of challenge dice to roll.")
        .setRequired(true)),
  async execute(interaction:CommandInteraction) {

    let cname = "";
    const cnameOption = interaction.options.get("character-name");
    if(cnameOption) {
      cname = cnameOption.value as string;
    }

    let pdice = 0;
    const pdiceOption = interaction.options.get("player-dice");
    if(pdiceOption) {
      pdice = pdiceOption.value as number;
    }

    let cdice = 0;
    const cdiceOption = interaction.options.get("challenge-dice");
    if(cdiceOption) {
      cdice = cdiceOption.value as number;
    }

    const result = rollOpposedRequest(cname, pdice, cdice);
    await interaction.reply(result);
  },
};
