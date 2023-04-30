import { Schema, model} from "mongoose";

const characterSchema = new Schema({
  name: {
    required: true,
    type: String
  },
  owner: {
    required: true,
    type: String
  },
  items: [String],
  words: [String],
  star: Boolean
});

const gameSchema = new Schema({
  discordChannelID: {
    type: String,
    unique: true,
    required: true
  },
  characters: [characterSchema]
});


const Character = model("Character", characterSchema);
const Game = model("Game", gameSchema);

export { Character, Game };
