import settings from "../settings";
import helpers from "../helpers";
import rules from "../rules";
import { Message, GuildMemberManager } from "discord.js";

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
    helpText: "Request a player to make a roll.",
    parameters: ["Player Name", "Player Dice"],
    callback: function(pname:string, pdice:string, cb: callback) {
      const members = this.guild.members as GuildMemberManager;
      const member = helpers.playerSearch(members, pname);
      cb(rules.rollRequest(member, parseInt(pdice)));
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
    helpText: "Request a player make an opposed roll.",
    parameters: ["Player Name", "Player Dice", "Challenge Dice"],
    callback: function(pname:string, pdice:string, cdice:string, cb: callback) {
      const members = this.guild.members as GuildMemberManager;
      const member = helpers.playerSearch(members, pname);
      cb(rules.rollOpposedRequest(member, parseInt(pdice), parseInt(cdice)));
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
