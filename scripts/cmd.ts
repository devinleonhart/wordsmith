/**
 * Local command harness — run any bot command in the terminal without Discord.
 *
 * Usage:
 *   pnpm cmd <command> [--user <name>] [--<option> <value> ...]
 *   pnpm cmd --list
 *
 * Examples:
 *   pnpm cmd d20 --target-number 12
 *   pnpm cmd r --player-dice 4
 *   pnpm cmd ro --player-dice 3 --challenge-dice 2
 *   pnpm cmd rr --character-name Frodo --player-dice 3
 *   pnpm cmd ror --character-name Aragorn --player-dice 4 --challenge-dice 2
 *   pnpm cmd pokemon --name charizard
 *   pnpm cmd typecheck --attack_type electric --defender_type1 water
 *   pnpm cmd typecheck --attack_type fire --defender_type1 grass --defender_type2 ice
 *   pnpm cmd effectiveness --attack_type water --pokemon charizard
 */

import { type ChatInputCommandInteraction, type Client } from 'discord.js'
import { commands as registeredCommands } from '../src/registry'

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2)
const commandName = argv[0] && !argv[0].startsWith('--') ? argv[0] : undefined
const flags: Record<string, string> = {}

for (let i = commandName ? 1 : 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) {
    const key = argv[i].slice(2)
    const next = argv[i + 1]
    if (next !== undefined && !next.startsWith('--')) {
      flags[key] = next
      i++
    } else {
      flags[key] = 'true'
    }
  }
}

// ---------------------------------------------------------------------------
// Command discovery
// ---------------------------------------------------------------------------

interface DiscoveredCommand {
  name: string
  description: string
  options: Array<{ name: string; description: string; required: boolean; type: number }>
  execute: (interaction: unknown) => Promise<void>
}

const OPTION_TYPES: Record<number, string> = {
  3: 'string',
  4: 'integer',
  5: 'boolean',
  10: 'number',
}

interface CommandJSON {
  name: string
  description: string
  options?: Array<{ name: string; description: string; required?: boolean; type: number }>
}

// Same list the bot registers (src/registry.ts), so the harness can't drift from it.
function loadCommands(): DiscoveredCommand[] {
  const commands = registeredCommands.map(command => {
    const json = command.data.toJSON() as CommandJSON
    return {
      name: json.name,
      description: json.description,
      options: (json.options ?? []).map(o => ({
        name: o.name,
        description: o.description,
        required: o.required ?? false,
        type: o.type,
      })),
      // No gateway client locally; no command uses the client argument.
      execute: (interaction: unknown) =>
        command.execute(interaction as ChatInputCommandInteraction, undefined as unknown as Client),
    }
  })
  return commands.sort((a, b) => a.name.localeCompare(b.name))
}

// ---------------------------------------------------------------------------
// --list
// ---------------------------------------------------------------------------

if ('list' in flags || commandName === undefined) {
  const commands = loadCommands()
  console.log('\nAvailable commands:\n')
  for (const cmd of commands) {
    console.log(`  /${cmd.name}`)
    console.log(`      ${cmd.description}`)
    for (const opt of cmd.options) {
      const type = OPTION_TYPES[opt.type] ?? `type:${opt.type}`
      const req = opt.required ? '' : '  (optional)'
      console.log(`      --${opt.name}  <${type}>${req}`)
    }
    console.log()
  }
  console.log('  --user <name>   Discord username shown in roll results (default: $USER)\n')
  process.exit(0)
}

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------

const commands = loadCommands()
const cmd = commands.find(c => c.name === commandName)

if (!cmd) {
  console.error(`\nUnknown command: "${commandName}"`)
  console.error('Run "pnpm cmd --list" to see available commands.\n')
  process.exit(1)
}

const username = flags.user ?? process.env.USER ?? 'Player'
const responses: string[] = []

function coerce(value: string): string | number {
  const n = Number(value)
  return Number.isNaN(n) ? value : n
}

const interaction = {
  member: { user: { username } },
  options: {
    get(name: string) {
      return name in flags ? { value: coerce(flags[name]) } : null
    },
    getString(name: string): string | null {
      return flags[name] ?? null
    },
    getInteger(name: string): number | null {
      return name in flags ? parseInt(flags[name], 10) : null
    },
  },
  reply(content: string) {
    responses.push(content)
    return Promise.resolve()
  },
  deferReply() {
    // no-op — locally there is no loading state to show
    return Promise.resolve()
  },
  editReply(content: string) {
    responses.push(content)
    return Promise.resolve()
  },
}

// Header
const optionStr = Object.entries(flags)
  .filter(([k]) => k !== 'user')
  .map(([k, v]) => `${k}:${v}`)
  .join('  ')
const header = `/${commandName}${optionStr ? `  ${optionStr}` : ''}  (user: ${username})`
console.log(`\n${header}`)
console.log('─'.repeat(Math.max(48, header.length + 2)))

void (async () => {
  try {
    await cmd.execute(interaction)
    if (responses.length === 0) {
      console.log('(no response)')
    } else {
      for (const r of responses) {
        console.log(r)
      }
    }
  } catch (err) {
    console.error('\nCommand threw an unexpected error:')
    console.error(err)
    process.exit(1)
  }
})()
