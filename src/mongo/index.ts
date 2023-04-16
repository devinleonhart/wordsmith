import mongoose from "mongoose";
import settings from "../settings";
import { Character, Game } from "./models";

const uri = settings.mongoConnectionURI;

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

  console.log("Characters:", characters);
  console.log("Game:", games);
}

export { setupMongo };
