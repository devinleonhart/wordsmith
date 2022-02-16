import * as FuzzyDice from "fuzzy-dice";

export enum Copy {
  almostMessage= "You're gaining ground! Momentum +1",
  criticalSuccessMessage= "You heroically defeat the challenge! Momentum +4",
  failureMessage= "A severe setback... You don't get what you asked for. Momentum -3",
  missMessage= "You can feel victory slipping away. Momentum -1",
  stumbleMessage= "A serious error pushes you further from your goal. Momentum -2",
  successMessage= "You did it! Momentum +3",
  poisonedMessage= "The distorion intensifies...",
  unknownMessage= "An unknown outcome has been rolled.",
}

export enum DiscordEmotes {
  redDiamond=":diamonds:",
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

export enum Outcomes {
  almost= "almost",
  criticalSuccess= "critical success",
  failure= "failure",
  miss= "miss",
  partialSuccess= "partial success",
  stumble= "stumble",
  success= "success",
  poisoned= "poisoned",
  unknown= "unknown",
}

export enum ValidationError {
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
export function buildEmoteString(emote:string, numberOfEmotes:number):string {
  let emotes = "";
  for (let i = 0; i < numberOfEmotes; i++) {
    emotes += `${emote} `;
  }
  return emotes;
}

export function poisonRoll(challengeDice:number, rollResult:FuzzyDice.opposedCheckResponse):FuzzyDice.poisonedOpposedCheckResponse {

  // Poison Feature Flag
  const poisonDice = false;

  const poisonedRollResult:FuzzyDice.poisonedOpposedCheckResponse =  {
    "num_successes": rollResult.num_successes,
    "num_criticals": rollResult.num_criticals,
    "num_opposed_successes": 0,
    "num_opposed_criticals": 0,
    "outcome": rollResult.outcome,
    "magnitude": rollResult.magnitude,
  };

  if(poisonDice) {

    // Reroll the opposing roll, now that the opponent can crit with the poison mechanic.
    for(let i = 0; i < challengeDice; i++) {
      const diceRoll = Math.floor(Math.random() * 8) + 1;
      if(diceRoll == 8) {
        poisonedRollResult.num_opposed_criticals += 1;
      }
      else if(diceRoll >= 5) {
        poisonedRollResult.num_opposed_successes += 1;
      }
    }

    // Recalculate the magintude of the roll.
    poisonedRollResult.magnitude =
        (poisonedRollResult.num_criticals + poisonedRollResult.num_successes) -
        (poisonedRollResult.num_opposed_criticals + poisonedRollResult.num_opposed_successes);

    // Determine the outcome of the roll with poison as the highest priority.
    if(poisonedRollResult.num_opposed_criticals >= 2) {
      poisonedRollResult.outcome = "poisoned";
    }
    else if(
      poisonedRollResult.num_criticals >= 2
    ) {
      poisonedRollResult.outcome = "critical success";
    }
    else if(
      poisonedRollResult.num_criticals + poisonedRollResult.num_successes >=
        poisonedRollResult.num_opposed_criticals + poisonedRollResult.num_opposed_successes
    ) {
      poisonedRollResult.outcome = "success";
    }
    else if(
      poisonedRollResult.num_criticals + poisonedRollResult.num_successes == 0
    ) {
      poisonedRollResult.outcome = "failure";
    }
    else {
      poisonedRollResult.outcome = "partial success";
    }
  }
  else {
    poisonedRollResult.num_opposed_successes = rollResult.num_opposed_successes;
  }

  return poisonedRollResult;
}
