import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

import { roll } from '../rules';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('r')
		.setDescription('Make a roll in wordsmith.')
    .addIntegerOption(option =>
      option.setName('pdice')
        .setDescription('The number of player dice being rolled.')
        .setRequired(true)),
	async execute(interaction:CommandInteraction) {
    let name = '';
    if(interaction.member) {
       name = interaction.member.user.username;
    }

    let pdice = 0;
    const pdiceOption = interaction.options.get('pdice');
    if(pdiceOption) {
      pdice = pdiceOption.value as number;
    }

    try {
      const result = roll(name, pdice);
      await interaction.reply(result);
    } catch (error) {
      console.error(error);
      await interaction.reply('Something went wrong with /r');
    }
	},
};
