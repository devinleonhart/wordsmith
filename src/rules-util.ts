export enum Copy {
  criticalSuccessMessage = "Critical Success! You have succeeded with style!",
  successMessage = "You did it!",
  majorDefeatMessage = "Ouch! You have suffered major defeat...",
  minorDefeatMessage = "Almost! You have suffered minor defeat...",
  failureMessage = "Failure! You have suffered a major defeat... and possibly lose health!",
  unknownMessage = "An unknown outcome has been rolled.",
}

export enum DiscordEmotes {
  redDiamond = ":diamonds:",
  blueDiamond = ":small_blue_diamond:",
  cryingCatFace = ":crying_cat_face:",
  orangeDiamond = ":small_orange_diamond:",
  poutingCat = ":pouting_cat:",
  questionMark = ":question:",
  screamCat = ":scream_cat:",
  smileCat = ":smile_cat:",
  smirkingCatWithBeer = ":beer: :smirk_cat:",
  star = ":star2:",
  skull = ":skull_crossbones:",
}

export enum Outcomes {
  majorDefeat = "major defeat",
  minorDefeat = "minor defeat",
  partialSuccess = "partial success",
  criticalSuccess = "critical success",
  failure = "failure",
  success = "success",
  unknown = "unknown",
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
export function buildEmoteString(
  emote: string,
  numberOfEmotes: number
): string {
  let emotes = "";
  for (let i = 0; i < numberOfEmotes; i++) {
    emotes += `${emote} `;
  }
  return emotes;
}

export function buildPoisonedEmoteString(
  emote: string,
  poisonedEmote: string,
  numberOfEmotes: number,
  poisonedChance: number
): string {
  let emotes = "";
  for (let i = 0; i < numberOfEmotes; i++) {
    if(Math.random() < poisonedChance) {
      emotes += `${poisonedEmote} `;
    }
    else {
      emotes += `${emote} `;
    }
  }
  return emotes;
}
