import { SlashCommandBuilder } from '@discordjs/builders'
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js'
import { WordsmithError } from '../../classes/wordsmithError'
import { getMaze, getSquare, getGoalKey, type MazeData } from '../../utils/mazeLoader'
import {
  addVisited,
  collectGem,
  getState,
  getVisited,
  initMaze,
  isGemCollected,
  resetMaze,
  setState
} from '../../database/mazeRepository'

const DELTAS: Record<string, [number, number]> = {
  north: [0, -1],
  south: [0,  1],
  east:  [1,  0],
  west:  [-1, 0]
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maze')
    .setDescription('Navigate the underground maze.')
    .addSubcommand(sub =>
      sub
        .setName('go')
        .setDescription('Move in a direction.')
        .addStringOption(opt =>
          opt
            .setName('direction')
            .setDescription('Which way to go.')
            .setRequired(true)
            .addChoices(
              { name: 'North', value: 'north' },
              { name: 'South', value: 'south' },
              { name: 'East',  value: 'east'  },
              { name: 'West',  value: 'west'  }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('look').setDescription('Look around your current location.')
    )
    .addSubcommand(sub =>
      sub.setName('reset').setDescription('Reset the maze back to the beginning.')
    ),

  async execute (interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand()
    const guildId = interaction.guildId

    if (!guildId) {
      throw new WordsmithError('The maze can only be played in a server.')
    }

    switch (sub) {
      case 'go':    return handleGo(interaction, guildId)
      case 'look':  return handleLook(interaction, guildId)
      case 'reset': return handleReset(interaction, guildId)
    }
  }
}

function ensureState (guildId: string): { x: number; y: number } {
  let state = getState(guildId)
  if (!state) {
    const { start } = getMaze()
    initMaze(guildId, start.x, start.y)
    state = start
  }
  return state
}

function buildReply (
  description: string,
  map: string,
  extraLines: string[] = []
): string {
  const parts = [`**${description}**`, map, ...extraLines]
  return parts.filter(Boolean).join('\n\n')
}

async function handleGo (interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
  const direction = interaction.options.getString('direction', true)
  const [dx, dy] = DELTAS[direction]
  const state = ensureState(guildId)
  const nx = state.x + dx
  const ny = state.y + dy

  const target = getSquare(nx, ny)

  if (!target || (!target.passable && !target.diggable)) {
    await interaction.reply({
      content: "The way is blocked. You can't go that way.",
      flags: MessageFlags.Ephemeral
    })
    return
  }

  setState(guildId, nx, ny)
  addVisited(guildId, nx, ny)

  const maze = getMaze()
  const visited = getVisited(guildId)
  const goalKey = getGoalKey()
  const map = renderMap(maze, { x: nx, y: ny }, visited, goalKey)

  const extraLines: string[] = []
  if (target.diggable) extraLines.push('*You swing your pick and break through the wall.*')
  if (target.gem && !isGemCollected(guildId, nx, ny)) {
    collectGem(guildId, nx, ny)
    extraLines.push(`*You pocket the ${target.gem}.*`)
  }
  if (target.goal) extraLines.push('🎉 **You found the Diamond Vault!**')

  await interaction.reply({ content: buildReply(target.description, map, extraLines) })
}

async function handleLook (interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
  const state = ensureState(guildId)
  const square = getSquare(state.x, state.y)

  if (!square) throw new WordsmithError('Current position is invalid. Use `/maze reset` to start over.')

  const maze = getMaze()
  const visited = getVisited(guildId)
  const goalKey = getGoalKey()
  const map = renderMap(maze, state, visited, goalKey)

  await interaction.reply({ content: buildReply(square.description, map) })
}

async function handleReset (interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
  resetMaze(guildId)

  await interaction.reply({
    content: 'The maze has been reset. Your crew returns to the entrance.',
    flags: MessageFlags.Ephemeral
  })
}

function renderMap (
  maze: MazeData,
  pos: { x: number; y: number },
  visited: Set<string>,
  goalKey: string
): string {
  const rows: string[] = []
  for (let y = 0; y < maze.height; y++) {
    let row = ''
    for (let x = 0; x < maze.width; x++) {
      const key = `${x},${y}`
      const square = getSquare(x, y)
      const isAdjacent = (x === pos.x && Math.abs(y - pos.y) === 1) ||
                         (y === pos.y && Math.abs(x - pos.x) === 1)

      if (key === goalKey && visited.has(key)) {
        row += '💎'
      } else if (x === pos.x && y === pos.y) {
        row += '🔵'
      } else if (visited.has(key)) {
        row += square?.diggable ? '🟫' : '🟩'
      } else if (isAdjacent && square) {
        row += square.diggable ? '🟫' : '⬜'
      } else {
        row += '⬛'
      }
    }
    rows.push(row)
  }
  return rows.join('\n')
}
