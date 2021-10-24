import { readdirSync } from 'fs';
import { resolve } from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

import settings from './settings';

const commands = [];
const commandFiles = readdirSync(resolve(__dirname, './commands'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(settings.secretKey);

rest.put(Routes.applicationGuildCommands(settings.clientID, settings.guildID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
