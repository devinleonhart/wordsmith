import { MongoClient } from "mongodb";
import settings from "./settings";

const uri = settings.mongoConnectionURI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    await listDatabases(client);

  } catch(err) {
    console.error(err);
  }
}

async function listDatabases(client: MongoClient){
  const databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

export { connectToDatabase };
