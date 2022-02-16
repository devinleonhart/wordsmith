export enum Copy {
  almostMessage= "You're gaining ground! Momentum +1",
  criticalSuccessMessage= "You heroically defeat the challenge! Momentum +4",
  failureMessage= "A severe setback... You don't get what you asked for. Momentum -3",
  missMessage= "You can feel victory slipping away. Momentum -1",
  stumbleMessage= "A serious error pushes you further from your goal. Momentum -2",
  successMessage= "You did it! Momentum +3",
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
