const settings = require("./settings");
const Discord = require("discord.js");
const secret_key = settings.DISCORD_SECRET_KEY_WS;
const client = new Discord.Client();
const handlers = require("./handlers");

client.login(secret_key).catch((err) => {
  console.error(err);
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  if (!msg.content.startsWith(settings.prefix)) {
    return;
  }

  const args = msg.content.slice(settings.prefix.length + 1).split(" ");
  const command = args.shift().toLowerCase();
  try {
    const output = handlers(msg, command, args);
    msg.channel.send(output);
  } catch (error) {
    return msg.channel.send(error.message);
  }
});
