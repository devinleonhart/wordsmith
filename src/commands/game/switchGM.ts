import {
  SlashCommandBuilder,
  UserSelectMenuBuilder,
  ActionRowBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

const commandName = "switch-gm";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Switch the GM!"),
  async execute(interaction: CommandInteraction) {
    const menu = new UserSelectMenuBuilder()
      .setCustomId("switch-gm-menu")
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder("Select the new gm!");

    await interaction.reply({
      components: [
        new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu),
      ],
    });
  },
};
