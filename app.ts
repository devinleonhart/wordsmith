import settings from "./src/settings";
import { Client } from "discord.js";
import handlers from "./src/handlers";
import { setupRedisClient } from "./src/redis";

setupRedisClient();

const secret_key = settings.DISCORD_SECRET_KEY_WS;
const client = new Client();

client.login(secret_key).catch((err) => {
  console.error(err);
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("message", (msg) => {
  if (!msg.content.startsWith(settings.prefix)) {
    return;
  }

  const args = msg.content.slice(settings.prefix.length + 1).split(" ");
  const command = args.shift()?.toLowerCase() as string;

  try {
    handlers(msg, command, args, (output) => {
      msg.channel.send(output);
      msg.delete({ timeout: 1000 });
    });
  } catch (error) {
    return msg.channel.send(error.message);
  }
});
