import * as FuzzyDice from "fuzzy-dice";

// Wordsmith Dice
// 8 Sides, 4 Blanks, 1 Crit Symbols, 2 Crit Symbols for a critical roll.
const wsDiceType = new FuzzyDice.Dice(8, 4, 1, 2);

enum Copy {
  almostMessage= "You're gaining ground! Momentum +1",
  criticalSuccessMessage= "You heroically defeat the challenge! Momentum +4",
  failureMessage= "A severe setback... You don't get what you asked for. Momentum -3",
  missMessage= "You can feel victory slipping away. Momentum -1",
  stumbleMessage= "A serious error pushes you further from your goal. Momentum -2",
  successMessage= "You did it! Momentum +3",
  unknownMessage= "An unknown outcome has been rolled.",
}

enum DiscordEmotes {
  blueDiamond=":small_blue_diamond:",
  cryingCatFace= ":crying_cat_face:",
  orangeDiamond=":small_orange_diamond:",
  poutingCat= ":pouting_cat:",
  questionMark=":question:",
  screamCat=":scream_cat:",
  smileCat = ":smile_cat:",
  smileyCat= ":smiley_cat:",
  smirkingCatWithBeer= ":beer: :smirk_cat:",
  star=":star2:",
}

enum Outcomes {
  almost= "almost",
  criticalSuccess= "critical success",
  failure= "failure",
  miss= "miss",
  partialSuccess= "partial success",
  stumble= "stumble",
  success= "success",
}

enum ValidationError {
  notEnoughChallengeDice = "The number of challenge dice cannot be less than 1.",
  notEnoughPlayerDice = "The number of player dice cannot be less than 1.",
}

/**
 * Builds a string of emotes.
 *
 * @param {string} emote - A Discord emote. eg: :star:
 * @param {number} numberOfEmotes - The number of emotes that should be returned in the string.
 * @return {string} The emotes as a single string.
 */
function buildEmoteString(emote:string, numberOfEmotes:number):string {
  let emotes = "";
  for (let i = 0; i < numberOfEmotes; i++) {
    emotes += emote;
  }
  return emotes;
}

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

  const data: rollOpposedData = {
    challengeBlanks: challengeDice - rollResult.num_opposed_successes,
    challengeResult: "",
    explanation: "",
    outcome: "",
    playerBlanks: playerDice - rollResult.num_successes - rollResult.num_criticals,
    playerName: playerName,
    playerResult: "",
    reaction: "",
  }

  // Populate the reaction, outcome and explanation.
  switch(rollResult.outcome) {
    case Outcomes.success:
      data.reaction = DiscordEmotes.smileCat;
      data.explanation = Copy.successMessage;
      break;
    case Outcomes.partialSuccess:
      if (Math.abs(rollResult.magnitude) === 1) {
        data.reaction = DiscordEmotes.smileyCat;
        data.outcome = Outcomes.almost;
        data.explanation = Copy.almostMessage;
      } else if (Math.abs(rollResult.magnitude) === 2) {
        data.reaction = DiscordEmotes.poutingCat;
        data.outcome = Outcomes.miss;
        data.explanation = Copy.missMessage;
      } else if (Math.abs(rollResult.magnitude) >= 3) {
        data.reaction = DiscordEmotes.cryingCatFace;
        data.outcome = Outcomes.stumble;
        data.explanation = Copy.stumbleMessage;
      }
      break;
    case Outcomes.criticalSuccess:
      data.reaction = DiscordEmotes.smirkingCatWithBeer;
      data.explanation = Copy.criticalSuccessMessage;
      break;
    case Outcomes.failure:
      data.reaction = DiscordEmotes.screamCat;
      data.explanation = Copy.failureMessage;
      break;
    default:
      data.reaction = DiscordEmotes.questionMark;
      data.explanation = Copy.unknownMessage;
      break;
  };

  // Populate the player result and challenge result.
  data.playerResult += buildEmoteString(DiscordEmotes.star, rollResult.num_criticals)
  data.playerResult += buildEmoteString(DiscordEmotes.orangeDiamond, rollResult.num_successes)
  data.playerResult += buildEmoteString(DiscordEmotes.blueDiamond, data.playerBlanks)
  data.challengeResult += buildEmoteString(DiscordEmotes.orangeDiamond, rollResult.num_opposed_successes)
  data.challengeResult += buildEmoteString(DiscordEmotes.blueDiamond, data.challengeBlanks)

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
