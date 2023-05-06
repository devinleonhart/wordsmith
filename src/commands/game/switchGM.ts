import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { switchGM } from "../../mongo/helpers";

const commandName = "switch-gm";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Make another use the gm of this game.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user who will become the gm.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const sco: SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
      options: {
        user: interaction.options.get("user")?.value as string,
      },
    };

    await switchGM(sco);
    await interaction.reply("GM swapped!");
  },
};
