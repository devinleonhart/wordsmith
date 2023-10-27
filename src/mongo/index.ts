import mongoose from "mongoose";
import settings from "../settings";

const uri = settings.mongoConnectionURI;

async function setupMongo() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(uri);
    console.log("Connnected to MongoDB!")
  } catch (err) {
    console.error(err);
  }
}

export { setupMongo };
