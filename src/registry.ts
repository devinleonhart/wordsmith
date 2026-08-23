import { type BotCommand, type BotEvent } from './core/command'

// Events
import interactionCreate from './events/interactionCreate'
import ready from './events/ready'

// Dice commands
import roll from './features/dice/commands/roll'
import rollOpposed from './features/dice/commands/rollOpposed'
import rollNotation from './features/dice/commands/rollNotation'

// Challenge commands
import gm from './features/challenge/commands/gm'
import attempt from './features/challenge/commands/attempt'

// Roster commands
import character from './features/roster/commands/character'
import star from './features/roster/commands/star'
import unstar from './features/roster/commands/unstar'

// Pokédex commands
import effectiveness from './features/pokedex/commands/effectiveness'
import move from './features/pokedex/commands/move'
import pokemon from './features/pokedex/commands/pokemon'
import typecheck from './features/pokedex/commands/typecheck'

export const commands: BotCommand[] = [
  roll, rollOpposed, rollNotation,
  gm, attempt,
  character, star, unstar,
  effectiveness, move, pokemon, typecheck
]

export const events: BotEvent[] = [interactionCreate, ready]
