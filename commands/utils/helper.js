const rollDice = (numberOfSides) => {
  return Math.ceil(Math.random() * numberOfSides);
};

const determineAbilityScoreModifier = (abilityScore) => {
  return Math.floor(abilityScore - 10 / 2);
};
module.exports = { rollDice, determineAbilityScoreModifier };
