import { readFileSync } from 'fs'
import { join } from 'path'

export interface MazeSquare {
  x: number
  y: number
  passable: boolean
  diggable: boolean
  gem: string | null
  goal: boolean
  description: string
}

export interface MazeData {
  width: number
  height: number
  start: { x: number; y: number }
}

interface MazeFile {
  width: number
  height: number
  start: { x: number; y: number }
  squares: MazeSquare[]
}

let mazeData: MazeData
let squareMap: Map<string, MazeSquare>

function load (): void {
  const raw = readFileSync(join(__dirname, '../mazes/default.json'), 'utf-8')
  const file = JSON.parse(raw) as MazeFile
  mazeData = { width: file.width, height: file.height, start: file.start }
  squareMap = new Map(file.squares.map(s => [`${s.x},${s.y}`, s]))
}

export function getMaze (): MazeData {
  if (!mazeData) load()
  return mazeData
}

export function getSquare (x: number, y: number): MazeSquare | null {
  if (!squareMap) load()
  return squareMap.get(`${x},${y}`) ?? null
}

export function getGoalKey (): string {
  if (!squareMap) load()
  for (const [key, square] of squareMap) {
    if (square.goal) return key
  }
  throw new Error('Maze has no goal square defined.')
}
