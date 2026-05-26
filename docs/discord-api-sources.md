# Discord.js v14 API Reference
## Sources for Character Management Implementation

All information verified against discord.js 14.18.0 and the Discord developer docs (docs.discord.com).

---

## 1. Subcommands

**Sources:**
- https://discord.js.org/docs/packages/discord.js/14.18.0/SlashCommandBuilder:Class
- https://discord.js.org/docs/packages/discord.js/14.18.0/SlashCommandSubcommandBuilder:Class
- https://docs.discord.com/developers/interactions/application-commands

**Pattern:**
```typescript
import { SlashCommandBuilder } from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('Manage your characters')
    .addSubcommand(sub => sub
      .setName('create')
      .setDescription('Create a new character')
      .addStringOption(opt => opt.setName('name').setDescription('Character name').setRequired(true))
      .addBooleanOption(opt => opt.setName('has-star').setDescription('Does this character have a star?'))
    )
    .addSubcommand(sub => sub
      .setName('list')
      .setDescription('List your characters')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand() // throws if not in subcommand context
    if (sub === 'create') { ... }
    if (sub === 'list') { ... }
  }
}
```

**Gotchas:**
- Once you call `addSubcommand()` on a builder you **cannot** also add regular options at the top level — the command becomes subcommand-only.
- Max **25 options/subcommands** per command (subcommands count against this limit).
- Nesting is capped at **2 levels**: `command → SubcommandGroup → Subcommand`. You cannot nest SubcommandGroups inside SubcommandGroups.
- `getSubcommand()` defaults to `required = true` and throws if not in a subcommand context; pass `false` to get `null` instead.
- `getSubcommandGroup(required = false)` returns `null` if no group is active — safe to call even when not using groups.

---

## 2. User Identity

**Source:** https://discord.js.org/docs/packages/discord.js/14.18.0/ChatInputCommandInteraction:Class

**Pattern:**
```typescript
const userId   = interaction.user.id      // string — stable Discord snowflake ID, use as DB key
const username = interaction.user.username
const member   = interaction.member       // GuildMember | null — only set when in a guild
```

**Gotchas:**
- Always key character data against `interaction.user.id`, not `interaction.user.username` — usernames can change; IDs never do.
- `interaction.member` is null in DM contexts; this bot is guild-only so it will always be set, but `interaction.user.id` is sufficient and simpler.
- `interaction.guildId` is available for guild-scoped data if needed later.

---

## 3. Ephemeral Replies

**Source:** https://discord.js.org/docs/packages/discord.js/14.18.0/ChatInputCommandInteraction:Class

**Pattern:**
```typescript
import { MessageFlags } from 'discord.js'

// Simple ephemeral
await interaction.reply({ content: 'Only you can see this', flags: MessageFlags.Ephemeral })

// Ephemeral with embed
await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })

// Defer then edit (for slow operations)
await interaction.deferReply({ flags: MessageFlags.Ephemeral })
await interaction.editReply({ embeds: [embed] })
```

**Gotchas:**
- The old `ephemeral: true` shorthand is deprecated in v14 — use `flags: MessageFlags.Ephemeral`.
- Ephemeral flag must be set on the *initial* reply or defer; you cannot make a follow-up ephemeral if the initial reply was not.
- `deferReply` buys up to 15 minutes; use it for any operation that may take more than 3 seconds (e.g. first-time DB init).

---

## 4. EmbedBuilder

**Source:** https://discordjs.guide/legacy/popular-topics/embeds

**Pattern:**
```typescript
import { EmbedBuilder } from 'discord.js'

const embed = new EmbedBuilder()
  .setColor(0x5865F2)
  .setTitle('Character Name')
  .setDescription('Active character')
  .addFields(
    { name: 'Has Star', value: 'Yes', inline: true },
  )
  .setFooter({ text: 'Wordsmith' })
  .setTimestamp()

await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
```

**Limits:**
| Element | Limit |
|---------|-------|
| Title | 256 chars |
| Description | 4,096 chars |
| Field name | 256 chars |
| Field value | 1,024 chars |
| Footer text | 2,048 chars |
| Author name | 256 chars |
| Fields per embed | 25 |
| Embeds per message | 10 |
| Total chars across all embeds | 6,000 |

**Gotchas:**
- `addFields()` accepts a single object or an array: `.addFields({ name, value }, { name, value })`.
- To modify a received embed: `EmbedBuilder.from(existingEmbed)` — embed objects are immutable.

---

## 5. Command Option Types

**Source:** https://discordjs.guide/legacy/slash-commands/advanced-creation

**Available types on SlashCommandSubcommandBuilder:**
```
addStringOption()      — free text; supports setMinLength / setMaxLength / setAutocomplete / addChoices
addBooleanOption()     — true / false toggle in UI
addIntegerOption()     — whole numbers; supports setMinValue / setMaxValue / addChoices
addNumberOption()      — floats; same constraints as integer
addUserOption()        — Discord user picker
addChannelOption()     — channel picker; filter with addChannelTypes()
addRoleOption()        — role picker
addMentionableOption() — user or role picker
addAttachmentOption()  — file upload
```

**For character commands we need:**
```typescript
.addStringOption(opt => opt
  .setName('name')
  .setDescription('Character name')
  .setRequired(true)
  .setMinLength(1)
  .setMaxLength(64)
  .setAutocomplete(true)   // if using autocomplete for switch/delete
)
.addBooleanOption(opt => opt
  .setName('has-star')
  .setDescription('Does this character have a star?')
  // no setRequired() — optional, defaults to false in our logic
)
```

**Gotchas:**
- Required options **must** come before optional ones in the builder chain — Discord enforces this in the UI.
- `addChoices()` max is 25 choices; use `setAutocomplete(true)` for dynamic lists longer than that.
- `getString('name')` with `required = true` throws if absent; use `getString('name', true)` as the idiomatic form.

---

## 6. Autocomplete

**Source:** https://discordjs.guide/legacy/slash-commands/autocomplete

**Registration (option level):**
```typescript
.addStringOption(opt => opt
  .setName('name')
  .setDescription('Character name')
  .setAutocomplete(true)
)
```

**Handling in interactionCreate.ts** (needs updating from current code):
```typescript
if (interaction.isAutocomplete()) {
  const command = client.commands.get(interaction.commandName)
  if (command?.autocomplete) await command.autocomplete(interaction)
  return
}
```

**In the command file:**
```typescript
async autocomplete(interaction: AutocompleteInteraction) {
  const focused = interaction.options.getFocused()  // string typed so far
  const userId  = interaction.user.id
  const chars   = getCharacters(userId)             // sync DB call
  const choices = chars
    .filter(c => c.name.toLowerCase().startsWith(focused.toLowerCase()))
    .slice(0, 25)
    .map(c => ({ name: c.name, value: c.name }))
  await interaction.respond(choices)
}
```

**Gotchas:**
- Must respond within **3 seconds** — no `deferReply` available on AutocompleteInteraction.
- Max **25 choices** per response; filter server-side before calling `respond()`.
- `respond([])` shows "No options match your search" — valid and useful.
- Autocomplete suggestions are **not enforced**: users can still type any free text and submit. Validate in `execute()`.
- `getFocused(true)` returns the full option object `{ name, value }` — useful when multiple options have autocomplete.
- Standard getters (`getString`, `getInteger`) work in autocomplete; user/member/role/channel getters do **not** — use `interaction.options.get('option').value` for snowflake IDs.

---

## 7. Buttons (for delete confirmation)

**Source:** https://discordjs.guide/legacy/interactive-components/buttons

**Pattern:**
```typescript
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'

const confirm = new ButtonBuilder()
  .setCustomId('confirm-delete')
  .setLabel('Delete')
  .setStyle(ButtonStyle.Danger)

const cancel = new ButtonBuilder()
  .setCustomId('cancel-delete')
  .setLabel('Cancel')
  .setStyle(ButtonStyle.Secondary)

const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirm, cancel)

await interaction.reply({
  content: `Delete character **${name}**?`,
  components: [row],
  flags: MessageFlags.Ephemeral,
})

// Collect the button press
const response = await interaction.fetchReply()
const collector = response.createMessageComponentCollector({
  filter: i => i.user.id === interaction.user.id,
  time: 15_000,
  max: 1,
})
collector.on('collect', async btn => {
  if (btn.customId === 'confirm-delete') { ... }
  else { await btn.update({ content: 'Cancelled.', components: [] }) }
})
```

**Button styles:**
| Style | Color | Use for |
|-------|-------|---------|
| `ButtonStyle.Primary` | Blue | Main action |
| `ButtonStyle.Secondary` | Grey | Cancel / neutral |
| `ButtonStyle.Success` | Green | Positive confirmation |
| `ButtonStyle.Danger` | Red | Destructive action |
| `ButtonStyle.Link` | Grey + arrow | External URL (no customId) |

**Gotchas:**
- `customId` max **100 characters**; must be unique within the message.
- Max **5 buttons per ActionRow**, max **5 ActionRows per message**.
- Link-style buttons do **not** fire interactions — they just open a URL.
- Buttons persist until the message is edited or deleted; always remove `components` after collection ends.
- Use `awaitMessageComponent()` for a one-shot await instead of a collector: simpler for single-use confirmations.

---

## 8. String Select Menus (for character switching)

**Source:** https://discordjs.guide/legacy/interactive-components/select-menus

**Pattern:**
```typescript
import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js'

const menu = new StringSelectMenuBuilder()
  .setCustomId('character-switch')
  .setPlaceholder('Choose a character')
  .addOptions(
    characters.map(c =>
      new StringSelectMenuOptionBuilder()
        .setLabel(c.name)
        .setValue(String(c.id))
        .setDescription(c.hasStar ? '★ Has star' : 'No star')
        .setDefault(c.id === activeId)
    )
  )

const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)

await interaction.reply({
  content: 'Switch to which character?',
  components: [row],
  flags: MessageFlags.Ephemeral,
})
```

**Handling:**
```typescript
if (interaction.isStringSelectMenu()) {
  const selected = interaction.values[0]  // the value string from the chosen option
}
```

**Gotchas:**
- Max **25 options** per select menu — this is a hard Discord limit.
- Only **one select menu per ActionRow** (unlike buttons, which can share a row).
- `setDefault(true)` pre-highlights the currently active character visually.
- `interaction.values` is always an array; for single-select menus take `[0]`.
- Alternatively, skip the select menu and just implement `/character switch name:<string>` with autocomplete — simpler for a small roster.

---

## 9. Guild-Scoped vs Global Commands

**Source:** https://docs.discord.com/developers/interactions/application-commands

**Summary:** This bot already uses guild-scoped registration (posting to `/applications/{id}/guilds/{guildId}/commands`). Keep it that way.

| | Guild commands | Global commands |
|---|---|---|
| Propagation | **Instant** | Up to 1 hour (read-repair eventually) |
| Rate limit | 200 creates/day/guild | 200 creates/day/guild |
| Capacity | 100 CHAT_INPUT per guild | 100 CHAT_INPUT globally |
| Use case | Development, single-server bots | Public bots on many servers |

**Gotchas:**
- Adding a new subcommand to an existing command counts as a command **update**, not a create — it does not consume the daily create quota.
- Re-registering all commands on every bot start (the current pattern in `handleCommands.ts`) is fine for a single-guild bot; avoid it for multi-guild bots.
- Subcommands added to an existing registered command appear instantly in Discord's UI after the REST call completes.

---

## 10. interactionCreate.ts Changes Required

The current handler at `src/events/client/interactionCreate.ts` routes `isChatInputCommand()` to commands and string select menus via `client.selectMenus`. To support autocomplete on the `/character switch` and `/character delete` name option, add an autocomplete branch:

```typescript
// Add before the existing isChatInputCommand() check:
if (interaction.isAutocomplete()) {
  const command = client.commands.get(interaction.commandName)
  if (command?.autocomplete) {
    await command.autocomplete(interaction)
  }
  return
}
```

The existing `WordsmithError` catch pattern does **not** apply to autocomplete interactions (they have no `reply()` method) — keep autocomplete errors silent or log them server-side only.
