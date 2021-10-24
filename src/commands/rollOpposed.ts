import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

import { rollOpposed } from '../rules';

const commandName = 'ro';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Make an opposed roll in wordsmith.')
    .addIntegerOption(option =>
      option.setName('player-dice')
        .setDescription('The number of player dice to roll.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('challenge-dice')
        .setDescription('The number of challenge dice to roll.')
        .setRequired(true)),
	async execute(interaction:CommandInteraction) {

    let name = '';
    if(interaction.member) {
       name = interaction.member.user.username;
    }

    let pdice = 0;
    const pdiceOption = interaction.options.get('player-dice');
    if(pdiceOption) {
      pdice = pdiceOption.value as number;
    }

    let cdice = 0;
    const cdiceOption = interaction.options.get('challenge-dice');
    if(cdiceOption) {
      cdice = cdiceOption.value as number;
    }

    try {
      const result = rollOpposed(name, pdice, cdice);
      await interaction.reply(result);
    } catch (error) {
      console.error(error);
      await interaction.reply(`Something went wrong with /${commandName}`);
    }
	},
};
