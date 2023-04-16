import { Schema, Types, model} from "mongoose";

const characterSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  owner: Types.ObjectId,
  items: [String],
  words: [String],
  star: Boolean
});

const gameSchema = new Schema({
  discordChannelID: {
    type: String,
    unique: true
  },
  discordChannelName: {
    type: String
  },
  characters: [characterSchema]
});

const userSchema = new Schema({
  discordUserID: {
    type: String,
    unique: true
  },
  games: [gameSchema]
});

const Character = model("Character", characterSchema);
const Game = model("Game", gameSchema);
const User = model("User", userSchema);

export { Character, Game, User };
