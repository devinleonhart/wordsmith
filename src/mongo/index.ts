import mongoose from "mongoose";
import settings from "../settings";

const uri = settings.mongoConnectionURI;

async function setupMongo() {
  try {
    console.log("Connecting to MongoDB...")
    console.log(uri)
    await mongoose.connect(uri);
  } catch (err) {
    console.error(err);
  }
}

export { setupMongo };
