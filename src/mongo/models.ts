import { Schema, model } from 'mongoose'

const characterSchema = new Schema({
  name: {
    required: true,
    type: String
  },
  owner: {
    required: true,
    type: String
  },
  active: {
    required: true,
    type: Boolean
  },
  items: {
    required: true,
    type: [String]
  },
  words: {
    required: true,
    type: [String]
  },
  star: {
    required: true,
    type: Boolean
  }
})

const gameSchema = new Schema({
  discordChannelID: {
    type: String,
    unique: true,
    required: true
  },
  gm: {
    required: true,
    type: String
  },
  characters: [characterSchema]
})

const Character = model('Character', characterSchema)
const Game = model('Game', gameSchema)

export { Character, Game }
