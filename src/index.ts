import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Client, Collection, Intents } from 'discord.js';

// Discord Secret Key.
import settings from './settings';

// Discord Client
const client = new Client({
  intents: [Intents.FLAGS.GUILD_MESSAGES] // Declare our bot intends to read messages.
});

// Import all of our custom commands the bot will perform.
client.commands = new Collection();
const commandFiles = readdirSync(resolve(__dirname, './commands'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// Run once the server is ready.
client.once('ready', c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Run on each interaction with our bot.
client.on('interactionCreate', async interaction => {

	if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

	if (!command) return;

  try {
    // If the interaction is a command, and it's a command we recognize, execute it.
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(settings.secretKey);
