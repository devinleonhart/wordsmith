// For Shadowrun related rolls.

const roll = function (dicePool, threshold, limit) {
  const rolledDice = new Array(dicePool)
    .fill()
    .map(() => Math.round(Math.random() * (6 - 1)) + 1)
    .sort((a, b) => a - b);
  let hits = rolledDice.filter((num) => num > 4).length;
  let limited = false;
  let result = "Success";
  let reaction = ":smirk_cat: :beer:";

  if (threshold > limit) {
    return `The threshold of the test exceeds the limit and is impossible. :crying_cat_face:`;
  }

  if (hits > limit) {
    limited = true;
    hits = limit;
  }

  if (hits < threshold) {
    result = "Failure";
    reaction = ":scream_cat:";
  }

  if (rolledDice.filter((num) => num === 1).length >= Math.ceil(dicePool / 2)) {
    if (hits === 0) {
      result += " + Critical Glitch";
      reaction = ":scream_cat: :skull:";
    } else {
      result += " + Glitch";
      reaction = ":joy_cat: :bomb:";
    }
  }
  return `${result}! [${rolledDice.join("] [")}] ${
    limited ? "[Limited]" : ""
  } ${reaction}`;
};

const rollOpposed = function (
  playerDicePool,
  playerLimit,
  opponentDicePool,
  opponentLimit
) {
  const rolledPlayerDice = new Array(playerDicePool)
    .fill()
    .map(() => Math.round(Math.random() * (6 - 1)) + 1)
    .sort((a, b) => a - b);
  const rolledOpponentDice = new Array(opponentDicePool)
    .fill()
    .map(() => Math.round(Math.random() * (6 - 1)) + 1)
    .sort((a, b) => a - b);
  let playerHits = rolledPlayerDice.filter((num) => num > 4).length;
  let opponentHits = rolledOpponentDice.filter((num) => num > 4).length;
  let result = "Success";
  let reaction = ":smirk_cat: :beer:";

  if (playerHits > playerLimit) {
    playerHits = playerLimit;
  }

  if (opponentHits > opponentLimit) {
    opponentHits = opponentLimit;
  }

  if (playerHits < opponentHits) {
    result = "Failure";
    reaction = ":scream_cat:";
  }

  if (
    rolledPlayerDice.filter((num) => num === 1).length >=
    Math.ceil(playerDicePool / 2)
  ) {
    if (hits === 0) {
      result += " + Critical Glitch";
      reaction = ":scream_cat: :skull:";
    } else {
      result += " + Glitch";
      reaction = ":joy_cat: :bomb:";
    }
  }
  return `${result}! Player Hits: ${playerHits} vs. Opposing Hits ${opponentHits} ${reaction}`;
};

const availability = function (availability, cha, negotiate, limit) {
  return `
  Availability Roll!
  Rolling with CHA + Negotiate: ${
    cha + negotiate
  } with a limit of ${limit} vs Availability: ${availability} with no limit.
  ${rollOpposed(cha + negotiate, limit, availability, 999)}
  `;
};

const availabilityWithContact = function (
  availability,
  cha,
  negotiate,
  connection
) {
  return `
  Availability Roll with Contact!
  Rolling with CHA + Negotiate: ${cha + negotiate} limit of ${
    3 + connection
  } vs Availability: ${availability} with no limit.
  ${rollOpposed(cha + negotiate, 3 + connection, availability, 999)}
  `;
};

exports.availability = availability;
exports.availabilityWithContact = availabilityWithContact;
exports.roll = roll;
exports.rollOpposed = rollOpposed;
