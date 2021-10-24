import * as FuzzyDice from "fuzzy-dice";

// Roll dice.
export const roll = (pname: string, pdice: number): string => {
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

// Roll dice opposed to challenge dice.
export const rollOpposed = (pname: string, pdice: number, cdice: number): string => {
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
  let newOutcome = "";
  let explanation = "";
  let reaction = ":question:";
  let pResult = "";
  let cResult = "";

  if (outcome === "success") {
    reaction = ":smile_cat:";
    explanation = "You did it! Momentum +3";
  } else if (outcome === "partial success") {
    if (Math.abs(rollResult.magnitude) === 1) {
      reaction = ":smiley_cat:";
      newOutcome = "almost";
      explanation = "You're gaining ground! Momentum +1";
    } else if (Math.abs(rollResult.magnitude) === 2) {
      reaction = ":pouting_cat:";
      newOutcome = "miss";
      explanation = "You can feel victory slipping away. Momentum -1";
    } else if (Math.abs(rollResult.magnitude) >= 3) {
      reaction = ":crying_cat_face:";
      newOutcome = "stumble";
      explanation = "A serious error pushes you further from your goal. Momentum -2";
    }
  } else if (outcome === "critical success") {
    reaction = ":beer: :smirk_cat:";
    explanation = "You heroically defeat the challenge! Momentum +4";
  } else if (outcome === "failure") {
    reaction = ":scream_cat:";
    explanation = "A severe setback... You don't get what you asked for. Momentum -3";
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
---
**${newOutcome !== "" ? newOutcome.toUpperCase() : outcome.toUpperCase()}** ${reaction}
${explanation}

${pname}'s Roll: ${pResult}
Challenge Roll: ${cResult}
---
`;
};

// Request a player to perform a roll.
export const rollRequest = (member: string, pdice: number): string => {
  return `
${member} must roll ${pdice} dice!
  `;
};

// Request a player to perform an opposed roll.
export const rollOpposedRequest = (member: string, pdice: number, cdice: number): string => {
  return `
${member} must make a ${pdice} ${cdice} opposed roll!
  `;
};
