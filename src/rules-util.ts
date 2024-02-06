export enum Copy {
  criticalSuccessMessage = "Critical Success!",
  successMessage = "Success!",
  partialSuccess = "Partial Success",
  failureMessage = "Failure...",
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

/**
 * Builds a "poisoned" string of emotes. A poisoned emote is one that has a percentage
 * chance of returning a different emote instead of a regular one.
 *
 * @param {string} emote - A Discord emote. eg: :star:
 * @param {string} poisonedEmote - The replaced remote. eg: :skull:
 * @param {number} numberOfEmotes - The number of emotes that should be returned in the string.
 * @param {number} poisonedChance - The chance of a poisoned emote being returned. 0-1
 * @return {string} The emotes as a single string.
 */
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
