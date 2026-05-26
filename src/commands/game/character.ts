import { SlashCommandBuilder } from '@discordjs/builders'
import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags
} from 'discord.js'
import { WordsmithError } from '../../classes/wordsmithError'
import {
  addItem,
  addWord,
  createCharacter,
  deleteCharacter,
  deleteItem,
  deleteWord,
  getActiveCharacter,
  getCharacters,
  getItems,
  getWords,
  setActiveCharacter
} from '../../database/characterRepository'

const BLURPLE = 0x5865F2
const RED = 0xED4245

module.exports = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('Manage your characters.')
    .addSubcommand(sub =>
      sub
        .setName('create')
        .setDescription('Create a new character.')
        .addStringOption(opt =>
          opt
            .setName('name')
            .setDescription("Your character's name.")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(64)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list').setDescription('List all your characters.')
    )
    .addSubcommand(sub =>
      sub
        .setName('switch')
        .setDescription('Switch your active character.')
        .addStringOption(opt =>
          opt
            .setName('name')
            .setDescription('The character to switch to.')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('delete')
        .setDescription('Delete a character.')
        .addStringOption(opt =>
          opt
            .setName('name')
            .setDescription('The character to delete.')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('info').setDescription('Show your active character.')
    )
    .addSubcommandGroup(group =>
      group
        .setName('word')
        .setDescription('Manage words for your active character.')
        .addSubcommand(sub =>
          sub
            .setName('add')
            .setDescription('Add a word to your active character.')
            .addStringOption(opt =>
              opt
                .setName('word')
                .setDescription('The word to add.')
                .setRequired(true)
                .setMaxLength(64)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('delete')
            .setDescription('Remove a word from your active character.')
            .addStringOption(opt =>
              opt
                .setName('word')
                .setDescription('The word to remove.')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
    )
    .addSubcommandGroup(group =>
      group
        .setName('item')
        .setDescription('Manage items for your active character.')
        .addSubcommand(sub =>
          sub
            .setName('add')
            .setDescription('Add an item to your active character.')
            .addStringOption(opt =>
              opt
                .setName('item')
                .setDescription('The item to add.')
                .setRequired(true)
                .setMaxLength(64)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('delete')
            .setDescription('Remove an item from your active character.')
            .addStringOption(opt =>
              opt
                .setName('item')
                .setDescription('The item to remove.')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
    ),

  async execute (interaction: ChatInputCommandInteraction) {
    const group = interaction.options.getSubcommandGroup()
    const sub = interaction.options.getSubcommand()
    const userId = interaction.user.id

    if (group === 'word') {
      if (sub === 'add') return handleWordAdd(interaction, userId)
      if (sub === 'delete') return handleWordDelete(interaction, userId)
    }

    if (group === 'item') {
      if (sub === 'add') return handleItemAdd(interaction, userId)
      if (sub === 'delete') return handleItemDelete(interaction, userId)
    }

    switch (sub) {
      case 'create': return handleCreate(interaction, userId)
      case 'list':   return handleList(interaction, userId)
      case 'switch': return handleSwitch(interaction, userId)
      case 'delete': return handleDelete(interaction, userId)
      case 'info':   return handleInfo(interaction, userId)
    }
  },

  async autocomplete (interaction: AutocompleteInteraction) {
    const group = interaction.options.getSubcommandGroup()
    const userId = interaction.user.id
    const focused = interaction.options.getFocused().toLowerCase()

    if (group === 'word') {
      const active = getActiveCharacter(userId)
      if (!active) { await interaction.respond([]); return }
      const words = getWords(active.id)
      await interaction.respond(
        words
          .filter(w => w.toLowerCase().startsWith(focused))
          .slice(0, 25)
          .map(w => ({ name: w, value: w }))
      )
      return
    }

    if (group === 'item') {
      const active = getActiveCharacter(userId)
      if (!active) { await interaction.respond([]); return }
      const items = getItems(active.id)
      await interaction.respond(
        items
          .filter(i => i.toLowerCase().startsWith(focused))
          .slice(0, 25)
          .map(i => ({ name: i, value: i }))
      )
      return
    }

    const chars = getCharacters(userId)
    await interaction.respond(
      chars
        .filter(c => c.name.toLowerCase().startsWith(focused))
        .slice(0, 25)
        .map(c => ({ name: c.name, value: c.name }))
    )
  }
}

async function handleCreate (interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
  const name = interaction.options.getString('name', true)
  const existingActive = getActiveCharacter(userId)

  try {
    const char = createCharacter(userId, name, false)
    if (!existingActive) setActiveCharacter(userId, char.id)
  } catch {
    throw new WordsmithError(`A character named **${name}** already exists in your roster.`)
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(BLURPLE)
        .setTitle('Character Created')
        .setDescription(`**${name}** has been added to your roster.`)
    ],
    flags: MessageFlags.Ephemeral
  })
}

async function handleList (interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
  const chars = getCharacters(userId)

  if (chars.length === 0) {
    await interaction.reply({
      content: 'You have no characters yet. Use `/character create` to make one.',
      flags: MessageFlags.Ephemeral
    })
    return
  }

  const active = getActiveCharacter(userId)
  const lines = chars
    .map(c => `${active?.id === c.id ? '▶ ' : '   '}**${c.name}**${c.star ? ' ★' : ''}`)
    .join('\n')

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(BLURPLE)
        .setTitle('Your Characters')
        .setDescription(lines)
    ],
    flags: MessageFlags.Ephemeral
  })
}

async function handleSwitch (interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
  const name = interaction.options.getString('name', true)
  const char = getCharacters(userId).find(c => c.name === name)

  if (!char) throw new WordsmithError(`You don't have a character named **${name}**.`)

  setActiveCharacter(userId, char.id)

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(BLURPLE)
        .setTitle('Character Switched')
        .setDescription(`**${name}** is now your active character.`)
    ],
    flags: MessageFlags.Ephemeral
  })
}

async function handleDelete (interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
  const name = interaction.options.getString('name', true)
  const active = getActiveCharacter(userId)

  if (!deleteCharacter(userId, name)) {
    throw new WordsmithError(`You don't have a character named **${name}**.`)
  }

  let description = `**${name}** has been deleted.`

  if (active?.name === name) {
    const remaining = getCharacters(userId)
    if (remaining.length > 0) {
      setActiveCharacter(userId, remaining[0].id)
      description += ` **${remaining[0].name}** is now your active character.`
    }
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(RED)
        .setTitle('Character Deleted')
        .setDescription(description)
    ],
    flags: MessageFlags.Ephemeral
  })
}

async function handleInfo (interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
  const char = getActiveCharacter(userId)

  if (!char) {
    await interaction.reply({
      content: 'You have no active character. Use `/character create` or `/character switch`.',
      flags: MessageFlags.Ephemeral
    })
    return
  }

  const words = getWords(char.id)
  const embed = new EmbedBuilder()
    .setColor(BLURPLE)
    .setTitle(char.name)
    .addFields({ name: 'Star', value: char.star ? 'Yes' : 'No', inline: true })

  if (words.length > 0) {
    embed.addFields({ name: 'Words', value: words.join(', ') })
  }

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
}

async function handleWordAdd (interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
  const active = getActiveCharacter(userId)
  if (!active) throw new WordsmithError('You have no active character. Use `/character switch` first.')

  const word = interaction.options.getString('word', true)

  try {
    addWord(active.id, word)
  } catch {
    throw new WordsmithError(`**${active.name}** already has the word **${word}**.`)
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(BLURPLE)
        .setTitle('Word Added')
        .setDescription(`**${word}** has been added to **${active.name}**.`)
    ],
    flags: MessageFlags.Ephemeral
  })
}

async function handleWordDelete (interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
  const active = getActiveCharacter(userId)
  if (!active) throw new WordsmithError('You have no active character. Use `/character switch` first.')

  const word = interaction.options.getString('word', true)

  if (!deleteWord(active.id, word)) {
    throw new WordsmithError(`**${active.name}** doesn't have the word **${word}**.`)
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(RED)
        .setTitle('Word Removed')
        .setDescription(`**${word}** has been removed from **${active.name}**.`)
    ],
    flags: MessageFlags.Ephemeral
  })
}

async function handleItemAdd (interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
  const active = getActiveCharacter(userId)
  if (!active) throw new WordsmithError('You have no active character. Use `/character switch` first.')

  const item = interaction.options.getString('item', true)

  try {
    addItem(active.id, item)
  } catch {
    throw new WordsmithError(`**${active.name}** already has the item **${item}**.`)
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(BLURPLE)
        .setTitle('Item Added')
        .setDescription(`**${item}** has been added to **${active.name}**.`)
    ],
    flags: MessageFlags.Ephemeral
  })
}

async function handleItemDelete (interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
  const active = getActiveCharacter(userId)
  if (!active) throw new WordsmithError('You have no active character. Use `/character switch` first.')

  const item = interaction.options.getString('item', true)

  if (!deleteItem(active.id, item)) {
    throw new WordsmithError(`**${active.name}** doesn't have the item **${item}**.`)
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(RED)
        .setTitle('Item Removed')
        .setDescription(`**${item}** has been removed from **${active.name}**.`)
    ],
    flags: MessageFlags.Ephemeral
  })
}
