import { GuildMember } from "discord.js";
import * as FuzzyDice from "fuzzy-dice";

// Awarding a star to a player.
const awardStar = (member: GuildMember):string => {
  return `
${member} gets a :star2:!
  `;
};

// Rolling dice in wordsmith.
const roll = (pname:string, pdice:number):string => {
  if (pdice <= 0) {
    return "The number of player dice cannot be less than 1.";
  }

  const wsDiceType = new FuzzyDice.Dice(8, 4, 1, 2);

  const rollResult = FuzzyDice.roll(wsDiceType, pdice);

  let pResult = "";

  const pNumBlanks = pdice - rollResult.num_successes - rollResult.num_criticals;

  for (let i = 0; i < rollResult.num_criticals; i++) {
    pResult += ":star2: ";
  }

  for (let i = 0; i < rollResult.num_successes; i++) {
    pResult += ":small_orange_diamond: ";
  }

  for (let i = 0; i < pNumBlanks; i++) {
    pResult += ":small_blue_diamond: ";
  }

  return `
${pname}'s Roll: ${pResult}
`;
};

// Rolling dice in wordsmith.
const rollOpposed = (pname:string, pdice:number, cdice:number):string => {
  if (pdice <= 0) {
    return "The number of player dice cannot be less than 1.";
  }

  if (cdice <= 0) {
    return "The number of challenge dice cannot be less than 1.";
  }

  const wsDiceType = new FuzzyDice.Dice(8, 4, 1, 2);

  const rollResult = FuzzyDice.opposed_check(
    wsDiceType,
    pdice,
    wsDiceType,
    cdice
  );

  const outcome = rollResult.outcome;
  let reaction = ":question:";
  let pResult = "";
  let cResult = "";

  if (outcome === "success") {
    reaction = ":smile_cat:";
  } else if (outcome === "partial success") {
    reaction = ":smile_cat:";
  } else if (outcome === "critical success") {
    reaction = ":beer: :smirk_cat:";
  } else if (outcome === "failure") {
    reaction = ":scream_cat:";
  }

  const pNumBlanks = pdice - rollResult.num_successes - rollResult.num_criticals;
  const cNumBlanks = cdice - rollResult.num_opposed_successes;

  for (let i = 0; i < rollResult.num_criticals; i++) {
    pResult += ":star2: ";
  }

  for (let i = 0; i < rollResult.num_successes; i++) {
    pResult += ":small_orange_diamond: ";
  }

  for (let i = 0; i < pNumBlanks; i++) {
    pResult += ":small_blue_diamond: ";
  }

  for (let i = 0; i < rollResult.num_opposed_successes; i++) {
    cResult += ":small_orange_diamond: ";
  }

  for (let i = 0; i < cNumBlanks; i++) {
    cResult += ":small_blue_diamond: ";
  }

  return `
**${outcome.toUpperCase()}** ${reaction}

${pname}'s Roll: ${pResult}
Challenge Roll: ${cResult}
`;
};

// Asking a player to perform a roll.
const rollRequest = (member:GuildMember, pdice:number):string => {
  return `
${member} must roll ${pdice} dice!
  `;
};

// Asking a player to perform an opposed roll.
const rollOpposedRequest = (member:GuildMember, pdice:number, cdice:number):string => {
  return `
${member} must make a ${pdice} ${cdice} opposed roll!
  `;
};

// Players announcing they have used a star.
const useStar = (playerName:string):string => {
  return `
**${playerName}** has used a :star2:!
`;
};

export default {
  awardStar,
  roll,
  rollOpposed,
  rollRequest,
  rollOpposedRequest,
  useStar
};
