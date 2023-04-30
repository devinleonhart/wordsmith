import mongoose from "mongoose";
import settings from "../settings";

const uri = settings.mongoConnectionURI;

async function setupMongo() {
  try {
    await mongoose.connect(uri);
  } catch(err) {
    console.error(err);
  }
}

export { setupMongo };
