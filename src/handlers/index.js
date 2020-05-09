const settings = require("../settings.js");
const helpers = require("../helpers");
const rules = require("../rules");

const commands = [
  {
    name: "as",
    helpText: "Award a star in Wordsmith",
    parameters: ["Player Name"],
    callback: function (pname) {
      const members = this.guild.members;
      const member = helpers.playerSearch(members, pname);
      return rules.awardStar(member);
    },
  },
  {
    name: "r",
    helpText: "Make a roll in wordsmith.",
    parameters: ["Player Dice", "Challenge Dice"],
    callback: function (pdice, cdice) {
      return rules.roll(parseInt(pdice), parseInt(cdice));
    },
  },
  {
    name: "rr",
    helpText: "Perform a roll request to a player.",
    parameters: ["Player Name", "Player Dice", "Challenge Dice"],
    callback: function (pname, pdice, cdice) {
      const members = this.guild.members;
      const member = helpers.playerSearch(members, pname);
      return rules.rollRequest(member, parseInt(pdice), parseInt(cdice));
    },
  },
  {
    name: "s",
    helpText: "Use a star in Wordsmith.",
    parameters: [],
    callback: function () {
      return rules.useStar(this.author.username);
    },
  },
];

module.exports = (msg, requestedCommand, args) => {
  if (requestedCommand === "help") {
    const helpText = (command) => {
      const paramsList = command.parameters
        .map((paramName) => `{${paramName}}`)
        .join(" ");
      const usage = `Usage: ${settings.prefix} ${command.name} ${paramsList}`;
      return `**${command.name}**: ${command.helpText}\n${usage}`;
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
      throw new Error(`Expected no arguments.`);
    }
    const paramsHelpString = command.parameters
      .map((paramName) => `{${paramName}}`)
      .join(" ");
    throw new Error(`Expected ${paramsHelpString}`);
  }

  return command.callback.apply(msg, args);
};
