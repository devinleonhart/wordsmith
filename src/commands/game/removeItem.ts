import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { removeItem } from "../../mongo/helpers";

const commandName = "remove-item";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Remove an item from a character.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item you'd like to remove.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const sco: SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
      options: {
        item: interaction.options.get("item")?.value as string,
      },
    };

    await removeItem(sco);
    await interaction.reply(`${sco.options?.item} removed!`);
  },
};
