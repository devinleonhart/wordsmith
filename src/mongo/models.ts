import { Schema, Types, model} from "mongoose";

const characterSchema = new Schema({
  name: {
    required: true,
    type: String,
    unique: true
  },
  owner: {
    required: true,
    type: Types.ObjectId
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

const userSchema = new Schema({
  discordUserID: {
    type: String,
    unique: true,
    required: true
  },
  games: [gameSchema]
});

const Character = model("Character", characterSchema);
const Game = model("Game", gameSchema);
const User = model("User", userSchema);

export { Character, Game, User };
