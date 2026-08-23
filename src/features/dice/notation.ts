import { random } from './rules-util'

export interface DiceExpr {
  count: number
  sides: number
  modifier: number
}

export interface DiceRoll {
  expr: DiceExpr
  rolls: number[]
  total: number
}

const MAX_COUNT = 100
const MAX_SIDES = 1000
const PATTERN = /^\s*(\d+)\s*d\s*(\d+)\s*([+-]\s*\d+)?\s*$/i

// Parse "3d6", "2d20+5", "1d8 - 1". Returns null on malformed or out-of-range input.
export function parseDiceExpr (input: string): DiceExpr | null {
  const match = PATTERN.exec(input)
  if (!match) return null

  const count = Number(match[1])
  const sides = Number(match[2])
  const modifier = match[3] ? Number(match[3].replace(/\s+/g, '')) : 0

  if (count < 1 || count > MAX_COUNT) return null
  if (sides < 2 || sides > MAX_SIDES) return null

  return { count, sides, modifier }
}

export function rollDice (expr: DiceExpr): DiceRoll {
  const rolls: number[] = []
  for (let i = 0; i < expr.count; i++) {
    rolls.push(Math.floor(random() * expr.sides) + 1)
  }
  const total = rolls.reduce((sum, r) => sum + r, 0) + expr.modifier
  return { expr, rolls, total }
}

// "2d6+3"
export function formatExpr (expr: DiceExpr): string {
  const mod = expr.modifier === 0 ? '' : expr.modifier > 0 ? `+${expr.modifier}` : `${expr.modifier}`
  return `${expr.count}d${expr.sides}${mod}`
}
