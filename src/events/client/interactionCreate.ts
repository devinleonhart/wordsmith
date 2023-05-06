import { Client, Events, Interaction } from "discord.js";
import { WordsmithError } from "../../classes/wordsmithError";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: Client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        if (error instanceof WordsmithError) {
          await interaction.reply({
            content: `${error.message}`,
            ephemeral: true,
          });
        }
        // Do nothing with any other error type. We do not wish to return unknown errors to the client.
      }
    } else if (interaction.isStringSelectMenu()) {
      const { selectMenus } = client;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      if (!menu) throw new Error("There is no code for this selectMenu.");

      try {
        await menu.execute(interaction, client);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
