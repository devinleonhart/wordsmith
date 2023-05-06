import { UserSelectMenuInteraction } from "discord.js";
import { switchGM } from "../../mongo/helpers";

module.exports = {
  data: {
    name: "switch-gm-menu",
  },
  async execute(interaction: UserSelectMenuInteraction) {
    const sco: SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
      options: {
        user: interaction.values[0],
      },
    };

    await switchGM(sco);

    await interaction.reply({
      content: `GM swapped!`,
    });
  },
};
