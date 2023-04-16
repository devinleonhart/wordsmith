
// import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import settings from "./settings";
import { Character, Game, User } from "./models";

const uri = settings.mongoConnectionURI;
// const client = new MongoClient(uri);

async function setupMongo() {
  try {
    await mongoose.connect(uri);
    await listModels();

  } catch(err) {
    console.error(err);
  }
}

async function listModels(){
  const characters = await Character.find();
  const games = await Game.find();
  const users = await User.find();

  console.log("Characters:", characters);
  console.log("Game:", games);
  console.log("Users:", users);
}

export { setupMongo };
