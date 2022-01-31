import * as FuzzyDice from "fuzzy-dice";
import { Copy, DiscordEmotes, Outcomes, ValidationError, buildEmoteString, poisonRoll } from "./rules-util";

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
  const rolledBlanks = dice - rollResult.num_successes - rollResult.num_criticals;

  let playerResult = "";
  playerResult += buildEmoteString(DiscordEmotes.star, rollResult.num_criticals);
  playerResult += buildEmoteString(DiscordEmotes.orangeDiamond, rollResult.num_successes);
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
export const rollOpposed = (playerName: string, playerDice: number, challengeDice: number): string => {
  if (playerDice <= 0) {
    return ValidationError.notEnoughPlayerDice;
  }

  if (challengeDice <= 0) {
    return ValidationError.notEnoughChallengeDice;
  }

  const rollResult = FuzzyDice.opposed_check(wsDiceType, playerDice, wsDiceType, challengeDice);
  const poisonedRollResult = poisonRoll(challengeDice, rollResult);

  const data: rollOpposedData = {
    "challengeBlanks": challengeDice - poisonedRollResult.num_opposed_criticals - poisonedRollResult.num_opposed_successes,
    "challengeResult": "",
    "explanation": "",
    "outcome": "",
    "playerBlanks": playerDice - poisonedRollResult.num_successes - poisonedRollResult.num_criticals,
    "playerName": playerName,
    "playerResult": "",
    "reaction": "",
  };

  // Populate the reaction, outcome and explanation.
  switch(poisonedRollResult.outcome) {
    case Outcomes.success:
      data.explanation = Copy.successMessage;
      data.outcome = Outcomes.success;
      data.reaction = DiscordEmotes.smileCat;
      break;
    case Outcomes.partialSuccess:
      if (Math.abs(poisonedRollResult.magnitude) === 1) {
        data.explanation = Copy.almostMessage;
        data.outcome = Outcomes.almost;
        data.reaction = DiscordEmotes.smileyCat;
      } else if (Math.abs(poisonedRollResult.magnitude) === 2) {
        data.explanation = Copy.missMessage;
        data.outcome = Outcomes.miss;
        data.reaction = DiscordEmotes.poutingCat;
      } else if (Math.abs(poisonedRollResult.magnitude) >= 3) {
        data.explanation = Copy.stumbleMessage;
        data.outcome = Outcomes.stumble;
        data.reaction = DiscordEmotes.cryingCatFace;
      }
      break;
    case Outcomes.criticalSuccess:
      data.explanation = Copy.criticalSuccessMessage;
      data.outcome = Outcomes.criticalSuccess;
      data.reaction = DiscordEmotes.smirkingCatWithBeer;
      break;
    case Outcomes.failure:
      data.explanation = Copy.failureMessage;
      data.outcome = Outcomes.failure;
      data.reaction = DiscordEmotes.screamCat;
      break;
    case Outcomes.poisoned:
      data.explanation = Copy.poisonedMessage;
      data.outcome = Outcomes.poisoned;
      data.reaction = DiscordEmotes.screamCat;
      break;
    default:
      data.explanation = Copy.unknownMessage;
      data.outcome = Outcomes.unknown;
      data.reaction = DiscordEmotes.questionMark;
      break;
  }

  // Populate the player result and challenge result.
  data.playerResult += buildEmoteString(DiscordEmotes.star, poisonedRollResult.num_criticals);
  data.playerResult += buildEmoteString(DiscordEmotes.orangeDiamond, poisonedRollResult.num_successes);
  data.playerResult += buildEmoteString(DiscordEmotes.blueDiamond, data.playerBlanks);
  data.challengeResult += buildEmoteString(DiscordEmotes.redDiamond, poisonedRollResult.num_opposed_criticals);
  data.challengeResult += buildEmoteString(DiscordEmotes.orangeDiamond, poisonedRollResult.num_opposed_successes);
  data.challengeResult += buildEmoteString(DiscordEmotes.blueDiamond, data.challengeBlanks);

  return `
---
**${data.outcome.toUpperCase()}** ${data.reaction}
${data.explanation}

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
export const rollOpposedRequest = (member: string, playerDice: number, challengeDice: number): string => {
  return `
${member} must make a ${playerDice} ${challengeDice} opposed roll!
  `;
};
