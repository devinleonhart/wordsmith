import { Client, Events, Interaction } from "discord.js";
import { WordsmithError } from "../../classes/wordsmithError";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: Client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      handleExecute(command, interaction, client);
    } else if (interaction.isStringSelectMenu()) {
      const { selectMenus } = client;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      if (!menu) throw new Error("No user selectMenu command found!");
      handleExecute(menu, interaction, client);
    } else if (interaction.isUserSelectMenu()) {
      const { selectMenus } = client;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      if (!menu) throw new Error("No user selectMenu command found!");
      handleExecute(menu, interaction, client);
    } else if (interaction.isContextMenuCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const contextCommand = commands.get(commandName);
      if (!contextCommand) throw new Error("No console command found!");
      handleExecute(contextCommand, interaction, client);
    }
  },
};

async function handleExecute(instance: any, interaction: any, client: any) {
  try {
    await instance.execute(interaction, client);
  } catch (error) {
    if (error instanceof WordsmithError) {
      await interaction.reply({
        content: `${error.message}`,
        ephemeral: true,
      });
    }
    // Do nothing with any other error type. We do not wish to return unknown errors to the client.
  }
}
