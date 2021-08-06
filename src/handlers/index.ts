import settings from "../settings";
import rules from "../rules";
import { Message } from "discord.js";

const commands:Command[] = [
  {
    name: "as",
    helpText: "Award a star in Wordsmith",
    parameters: ["Character Name"],
    callback: function(cname: string, cb: callback) {
      rules.awardStar(cname, cb);
    },
  },
  {
    name: "r",
    helpText: "Make a roll in wordsmith.",
    parameters: ["Player Dice"],
    callback: function(pdice: string, cb: callback) {
      const name = this.author.username;
      cb(rules.roll(name, parseInt(pdice)));
    },
  },
  {
    name: "rr",
    helpText: "Request a character to make a roll.",
    parameters: ["Player Name", "Player Dice"],
    callback: function(cname:string, pdice:string, cb: callback) {
      cb(rules.rollRequest(cname, parseInt(pdice)));
    },
  },
  {
    name: "ro",
    helpText: "Make an opposed roll in wordsmith.",
    parameters: ["Player Dice", "Challenge Dice"],
    callback: function(pdice:string, cdice:string, cb: callback) {
      const name = this.author.username;
      cb(rules.rollOpposed(name, parseInt(pdice), parseInt(cdice)));
    },
  },
  {
    name: "ror",
    helpText: "Request a character make an opposed roll.",
    parameters: ["Player Name", "Player Dice", "Challenge Dice"],
    callback: function(cname:string, pdice:string, cdice:string, cb: callback) {
      cb(rules.rollOpposedRequest(cname, parseInt(pdice), parseInt(cdice)));
    },
  },
  {
    name: "s",
    helpText: "Use a star in Wordsmith.",
    parameters: ["Character Name"],
    callback: function(cname: string, cb: callback) {
      rules.useStar(cname, cb);
    },
  },
];

const handlers = (msg:Message, requestedCommand:string, args:string[], cb:callback):string => {
  if (requestedCommand === "help") {
    const helpText = (command:Command) => {
      const paramsList = command.parameters
        .map((paramName) => `{${paramName}}`)
        .join(" ");
      const usage = `Usage: ${settings.prefix} ${command.name} ${paramsList}`;
      cb(`**${command.name}**: ${command.helpText}\n${usage}`);
    };
    return `Available commands:\n${commands
      .map((command) => helpText(command))
      .join("\n")}`;
  }

  const command = commands.find((command) => command.name === requestedCommand);

  if (!command) {
    throw new Error(
      `${requestedCommand} isn't a recognized command. Use ${settings.prefix} help for a listing of all commands`
    );
  }

  if (args.length !== command.parameters.length) {
    if (command.parameters.length === 0) {
      throw new Error("Expected no arguments.");
    }
    const paramsHelpString = command.parameters
      .map((paramName) => `{${paramName}}`)
      .join(" ");
    throw new Error(`Expected ${paramsHelpString}`);
  }

  command.callback.call(msg, ...args, cb);
};

export default handlers;
