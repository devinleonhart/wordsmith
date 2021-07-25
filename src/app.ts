import * as Discord from "discord.js";
import handlers from "./handlers";
import settings from "./settings";
import { setupRedisClient } from "./redis";

const secret_key = settings.DISCORD_SECRET_KEY_WS;
const client = new Discord.Client();
setupRedisClient();

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
