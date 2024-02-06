import * as FuzzyDice from "fuzzy-dice";
import {
  DiscordEmotes,
  Outcomes,
  ValidationError,
  buildEmoteString
} from "./rules-util";

// Wordsmith Dice
// 8 Sides, 4 Blanks, 1 Crit Symbols, 2 Crit Symbols for a critical roll.
const wsDiceType = new FuzzyDice.Dice(8, 4, 1, 2);

/**
 * Rolls dice and then uses emotes to display the result.
 *
 * @param {string} playerName - The name of the player rolling dice.
 * @param {number} dice - The number of dice being rolled.
 * @return {string} The dice roll expressed as emotes.
 */
export const roll = (playerName: string, dice: number): string => {
  if (dice <= 0) {
    return ValidationError.notEnoughPlayerDice;
  }

  const rollResult = FuzzyDice.roll(wsDiceType, dice);
  const rolledBlanks =
    dice - rollResult.num_successes - rollResult.num_criticals;

  let playerResult = "";
  playerResult += buildEmoteString(
    DiscordEmotes.star,
    rollResult.num_criticals
  );
  playerResult += buildEmoteString(
    DiscordEmotes.orangeDiamond,
    rollResult.num_successes
  );
  playerResult += buildEmoteString(DiscordEmotes.blueDiamond, rolledBlanks);

  return `
${playerName}'s Roll: ${playerResult}
`;
};

/**
 * Rolls player dice opposed by challenge dice and then uses emotes to display the result.
 *
 * @param {string} playerName - The name of the player rolling dice.
 * @param {number} playerDice - The number of player dice being rolled.
 * @param {number} challengeDice - The number of challenge dice being rolled.
 * @return {string} The dice roll expressed as emotes.
 */
export const rollOpposed = (
  playerName: string,
  playerDice: number,
  challengeDice: number
): string => {
  if (playerDice <= 0) {
    return ValidationError.notEnoughPlayerDice;
  }

  if (challengeDice <= 0) {
    return ValidationError.notEnoughChallengeDice;
  }

  const rollResult = FuzzyDice.opposed_check(
    wsDiceType,
    playerDice,
    wsDiceType,
    challengeDice
  );

  const data: rollOpposedData = {
    challengeBlanks: challengeDice - rollResult.num_opposed_successes,
    challengeResult: "",
    outcome: "",
    playerBlanks:
      playerDice - rollResult.num_successes - rollResult.num_criticals,
    playerName: playerName,
    playerResult: "",
    reaction: "",
  };

  // Populate the reaction and outcome.
  switch (rollResult.outcome) {
    case Outcomes.success:
      data.outcome = Outcomes.success;
      data.reaction = DiscordEmotes.smileCat;
      break;
    case Outcomes.partialSuccess:
      data.outcome = Outcomes.partialSuccess;
      data.reaction = DiscordEmotes.poutingCat;
      break;
    case Outcomes.criticalSuccess:
      data.outcome = Outcomes.criticalSuccess;
      data.reaction = DiscordEmotes.smirkingCatWithBeer;
      break;
    case Outcomes.failure:
      data.outcome = Outcomes.failure;
      data.reaction = DiscordEmotes.screamCat;
      break;
    default:
      data.outcome = Outcomes.unknown;
      data.reaction = DiscordEmotes.questionMark;
      break;
  }

  // Populate the player result and challenge result.
  data.playerResult += buildEmoteString(
    DiscordEmotes.star,
    rollResult.num_criticals
  );
  data.playerResult += buildEmoteString(
    DiscordEmotes.orangeDiamond,
    rollResult.num_successes
  );
  data.playerResult += buildEmoteString(
    DiscordEmotes.blueDiamond,
    data.playerBlanks
  );
  data.challengeResult += buildEmoteString(
    DiscordEmotes.orangeDiamond,
    rollResult.num_opposed_successes
  );
  data.challengeResult += buildEmoteString(
    DiscordEmotes.blueDiamond,
    data.challengeBlanks
  );

  return `
---
**${data.outcome.toUpperCase()}** ${data.reaction}

${data.playerName}'s Roll: ${data.playerResult}
Challenge Roll: ${data.challengeResult}
---
  `;
};

// Request a player to perform a roll.
export const rollRequest = (member: string, playerDice: number): string => {
  return `
${member} must roll ${playerDice} dice!
  `;
};

// Request a player to perform an opposed roll.
export const rollOpposedRequest = (
  member: string,
  playerDice: number,
  challengeDice: number
): string => {
  return `
${member} must make a ${playerDice} ${challengeDice} opposed roll!
  `;
};
