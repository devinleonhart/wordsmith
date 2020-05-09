const FuzzyDice = require("fuzzy-dice");

// Rolling dice in wordsmith.
const roll = (pdice, cdice) => {
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

Player Roll: ${pResult}
Challenge Roll: ${cResult}
`;
};

exports.roll = roll;
