const FuzzyDice = require("fuzzy-dice");

// Awarding a star to a player.
const awardStar = (member) => {
  return `
${member} gets a :star2:!
  `;
};

// Rolling dice in wordsmith.
const roll = (pname, pdice) => {
  if (pdice <= 0) {
    return `The number of player dice cannot be less than 1.`;
  }

  const wsDiceType = new FuzzyDice.Dice(8, 4, 1, 2);

  const rollResult = FuzzyDice.roll(wsDiceType, pdice);

  let pResult = "";

  let pNumBlanks = pdice - rollResult.num_successes - rollResult.num_criticals;

  for (i = 0; i < rollResult.num_criticals; i++) {
    pResult += ":star2: ";
  }

  for (i = 0; i < rollResult.num_successes; i++) {
    pResult += ":small_orange_diamond: ";
  }

  for (i = 0; i < pNumBlanks; i++) {
    pResult += ":small_blue_diamond: ";
  }

  return `
${pname}'s Roll: ${pResult}
`;
};

// Rolling dice in wordsmith.
const rollOpposed = (pname, pdice, cdice) => {
  if (pdice <= 0) {
    return `The number of player dice cannot be less than 1.`;
  }

  if (cdice <= 0) {
    return `The number of challenge dice cannot be less than 1.`;
  }

  const wsDiceType = new FuzzyDice.Dice(8, 4, 1, 2);

  const rollResult = FuzzyDice.opposed_check(
    wsDiceType,
    pdice,
    wsDiceType,
    cdice
  );

  let outcome = rollResult.outcome;
  let reaction = ":question:";
  let pResult = "";
  let cResult = "";

  if (outcome === "success") {
    reaction = ":smile_cat:";
  } else if (outcome === "partial success") {
    reaction = ":smile_cat:";
  } else if (outcome === "critical success") {
    reaction = ":smirk_cat: :beer:";
  } else if (outcome === "failure") {
    reaction = ":scream_cat:";
  }

  let pNumBlanks = pdice - rollResult.num_successes - rollResult.num_criticals;
  let cNumBlanks = cdice - rollResult.num_opposed_successes;

  for (i = 0; i < rollResult.num_criticals; i++) {
    pResult += ":star2: ";
  }

  for (i = 0; i < rollResult.num_successes; i++) {
    pResult += ":small_orange_diamond: ";
  }

  for (i = 0; i < pNumBlanks; i++) {
    pResult += ":small_blue_diamond: ";
  }

  for (i = 0; i < rollResult.num_opposed_successes; i++) {
    cResult += ":small_orange_diamond: ";
  }

  for (i = 0; i < cNumBlanks; i++) {
    cResult += ":small_blue_diamond: ";
  }

  return `
**${outcome.toUpperCase()}** ${reaction}

${pname}'s Roll: ${pResult}
Challenge Roll: ${cResult}
`;
};

// Asking a player to perform a roll.
const rollRequest = (member, pdice) => {
  return `
${member} must roll ${pdice} dice!
  `;
};

// Asking a player to perform an opposed roll.
const rollOpposedRequest = (member, pdice, cdice) => {
  return `
${member} must make a ${pdice} ${cdice} opposed roll!
  `;
};

// Players announcing they have used a star.
const useStar = (playerName) => {
  return `
**${playerName}** has used a :star2:!
`;
};

exports.awardStar = awardStar;
exports.roll = roll;
exports.rollOpposed = rollOpposed;
exports.rollRequest = rollRequest;
exports.rollOpposedRequest = rollOpposedRequest;
exports.useStar = useStar;
