import { type StringSelectMenuInteraction } from 'discord.js'
import { getCharacterData, switchActiveCharacter } from '../../mongo/helpers'
import { WordsmithError } from '../../classes/wordsmithError'

module.exports = {
  data: {
    name: 'switch-character-menu'
  },
  async execute (interaction: StringSelectMenuInteraction) {
    const sco: SlashCommandOptions = {
      playerID: interaction.user.id,
      discordChannelID: interaction.channelId,
      options: {
        characterID: interaction.values[0]
      }
    }

    await switchActiveCharacter(sco)
    const character = await getCharacterData(sco)

    if (!character) {
      throw new WordsmithError('No character data was found!')
    }

    await interaction.reply({
      content: `${character.name} is now ${interaction.user.username}'s active character!`
    })
  }
}
