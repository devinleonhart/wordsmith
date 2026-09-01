import { type BotCommand, type BotEvent } from './core/command'

// Events
import interactionCreate from './events/interactionCreate'
import ready from './events/ready'

// Dice commands
import d20 from './features/dice/commands/d20'
import roll from './features/dice/commands/roll'
import rollOpposed from './features/dice/commands/rollOpposed'
import rollOpposedRequest from './features/dice/commands/rollOpposedRequest'
import rollRequest from './features/dice/commands/rollRequest'

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
  d20, roll, rollOpposed, rollOpposedRequest, rollRequest,
  character, star, unstar,
  effectiveness, move, pokemon, typecheck
]

export const events: BotEvent[] = [interactionCreate, ready]
