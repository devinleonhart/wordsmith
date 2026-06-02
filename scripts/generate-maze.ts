/**
 * Maze generator — converts an ASCII layout file into src/mazes/default.json.
 *
 * Usage:
 *   pnpm maze-gen <layout-file> [--out <output-json>] [--preview]
 *
 * Examples:
 *   pnpm maze-gen src/mazes/layout.txt
 *   pnpm maze-gen src/mazes/layout.txt --out src/mazes/default.json
 *   pnpm maze-gen src/mazes/layout.txt --preview
 *
 * Layout character key:
 *   #   Hard wall (omitted from JSON)
 *   .   Passable floor
 *   S   Start position (passable floor)
 *   D   Diggable wall
 *   E   Emerald gem room
 *   R   Ruby gem room
 *   A   Amethyst gem room
 *   s   Sapphire gem room
 *   X   Goal room (the diamond vault)
 *
 * Rules:
 *   - Exactly one S and one X are required.
 *   - Every row must be the same length.
 *   - All cells outside the grid are treated as hard walls.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2)
const layoutPath = argv.find(a => !a.startsWith('--'))
const flags = new Set(argv.filter(a => a.startsWith('--')).map(a => a.slice(2)))

const outIndex = argv.indexOf('--out')
const outPath = outIndex !== -1 ? argv[outIndex + 1] : 'src/mazes/default.json'

if (!layoutPath) {
  console.error('Usage: pnpm maze-gen <layout-file> [--out <output-json>] [--preview]')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Character definitions
// ---------------------------------------------------------------------------

type CellChar = '.' | 'S' | 'D' | 'E' | 'R' | 'A' | 's' | 'X'

const GEM_MAP: Record<string, string> = {
  E: 'emerald',
  R: 'ruby',
  A: 'amethyst',
  s: 'sapphire',
}

// ---------------------------------------------------------------------------
// Description pools  (indexed by (x + y) % pool.length for variety)
// ---------------------------------------------------------------------------

const FLOOR_DESCS = [
  'A rough-hewn passage. Pickaxe marks line the walls.',
  'A low corridor. Loose pebbles crunch beneath your boots.',
  'A widened section of tunnel. Old timber supports prop up the ceiling.',
  'A straight run of passage. Torch brackets line the wall, long since emptied.',
  'A junction in the rock. Survey marks are scratched into the stone.',
  'A narrow corridor. The ceiling is close overhead.',
  'A chamber where several cuts meet. The air hangs still.',
  'A stretch of tunnel with glassy black walls that absorb the torchlight.',
  'A passage propped up by rusted iron brackets.',
  'A quiet section of tunnel. The silence here feels deliberate.',
  'A sloping stretch of corridor. Water trickles along the far wall.',
  'A crossroads carved deep in the rock. The stone here is older.',
  'A corridor with fossilised shells pressed into the walls.',
  'A section of tunnel where the ceiling soars unexpectedly high.',
  'A passage thick with the smell of damp earth and cold stone.',
]

const DIG_DESCS = [
  'Packed earth and loose gravel. It gives way after a few determined swings.',
  'A thin seam of soft limestone. One good strike and it crumbles.',
  'Compacted sand and clay. Your pick sinks in easily.',
  'A wall of densely packed earth. It resists, then yields.',
  'Soft shale and loose stone. A few strikes clear a passage through.',
  'A clay-heavy face. Your pick finds it workable.',
  'An iron-streaked rock face. Your pick sparks on impact.',
  'Moist clay and embedded stones. Your pick makes short work of it.',
  'A crumbling limestone wall. Dust rains down as your pick strikes.',
  'Loose gravel packed tight. It gives way after a few blows.',
  'Dense earth veined with soft mineral deposits.',
  'A thick seam of clay. Your pick sinks in with a satisfying thud.',
]

const GEM_DESCS: Record<string, string> = {
  emerald: 'A glittering hollow in the rock. A flawless emerald rests in a natural cradle of stone.',
  ruby:    'A deep crimson vein pools into a loose ruby on the floor, glowing like a banked coal.',
  amethyst:'A cluster of purple amethyst erupts from the far wall like frozen violet fire.',
  sapphire:'A deep blue sapphire gleams from a natural shelf, refracting your torchlight into cold sparks.',
}

const GOAL_DESC = 'The Diamond Vault. The chamber is perfectly smooth, as if shaped by intention rather than tools. At its centre, an enormous diamond the size of a closed fist pulses with pale, cold light — the prize every digger dreams of.'

const START_DESC = 'The entry chamber. Rough walls press close on either side. Fresh air still drifts in from behind you.'

// ---------------------------------------------------------------------------
// Parse layout
// ---------------------------------------------------------------------------

const raw = readFileSync(resolve(process.cwd(), layoutPath), 'utf-8')
const lines = raw.split('\n').filter(l => l.trim().length > 0)
const height = lines.length
const width = Math.max(...lines.map(l => l.length))

// Validate uniform width
for (let y = 0; y < height; y++) {
  if (lines[y].length !== width) {
    // Pad short lines rather than erroring
    lines[y] = lines[y].padEnd(width, '#')
  }
}

const VALID_CHARS = new Set(['.', 'S', 'D', 'E', 'R', 'A', 's', 'X', '#'])

let startCount = 0
let goalCount  = 0

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const ch = lines[y][x]
    if (!VALID_CHARS.has(ch)) {
      console.error(`Unknown character '${ch}' at (${x},${y}). Valid: # . S D E R A s X`)
      process.exit(1)
    }
    if (ch === 'S') startCount++
    if (ch === 'X') goalCount++
  }
}

if (startCount !== 1) { console.error(`Layout must have exactly one 'S' (found ${startCount}).`); process.exit(1) }
if (goalCount  !== 1) { console.error(`Layout must have exactly one 'X' (found ${goalCount}).`);  process.exit(1) }

// ---------------------------------------------------------------------------
// Build square list
// ---------------------------------------------------------------------------

interface Square {
  x: number
  y: number
  passable: boolean
  diggable: boolean
  gem: string | null
  goal: boolean
  description: string
}

let startX = 0
let startY = 0
const squares: Square[] = []

function pick<T>(pool: T[], x: number, y: number): T {
  return pool[(x + y * 3) % pool.length]
}

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const ch = lines[y][x]
    if (ch === '#') continue

    const gemName = GEM_MAP[ch] ?? null

    let description: string
    let passable: boolean
    let diggable: boolean
    let goal: boolean

    switch (ch) {
      case 'S':
        passable = true; diggable = false; goal = false
        description = START_DESC
        startX = x; startY = y
        break
      case 'X':
        passable = true; diggable = false; goal = true
        description = GOAL_DESC
        break
      case 'D':
        passable = false; diggable = true; goal = false
        description = pick(DIG_DESCS, x, y)
        break
      case 'E': case 'R': case 'A': case 's':
        passable = true; diggable = false; goal = false
        description = GEM_DESCS[gemName!]
        break
      default: // '.'
        passable = true; diggable = false; goal = false
        description = pick(FLOOR_DESCS, x, y)
    }

    squares.push({ x, y, passable, diggable, gem: gemName, goal, description })
  }
}

// ---------------------------------------------------------------------------
// Assemble and write JSON
// ---------------------------------------------------------------------------

const mazeJson = {
  width,
  height,
  start: { x: startX, y: startY },
  squares,
}

const jsonStr = JSON.stringify(mazeJson, null, 2)

if (flags.has('preview')) {
  // Print ASCII preview with a legend
  console.log('\nParsed layout:\n')
  for (let y = 0; y < height; y++) {
    console.log('  ' + lines[y])
  }
  console.log(`\n  ${width}×${height}  start:(${startX},${startY})`)
  const counts = {
    floor:    squares.filter(s => s.passable && !s.gem && !s.goal).length,
    diggable: squares.filter(s => s.diggable).length,
    gems:     squares.filter(s => s.gem).length,
    goal:     1,
  }
  console.log(`  floor:${counts.floor}  diggable:${counts.diggable}  gems:${counts.gems}  goal:${counts.goal}`)
  console.log()
} else {
  const absOut = resolve(process.cwd(), outPath)
  writeFileSync(absOut, jsonStr, 'utf-8')
  console.log(`\nWrote ${squares.length} squares → ${outPath}`)
  console.log(`  ${width}×${height}  start:(${startX},${startY})  diggable:${squares.filter(s => s.diggable).length}  gems:${squares.filter(s => s.gem).length}`)
  console.log()
}
