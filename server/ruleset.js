
const dice = require("./dice.js");

module.exports.attack = function(attackScore, dodgeScore, parryScore, blockScore, nbrOfConsecutiveAttacks)
{
  var result = {success: false};
  var orderedDefenceSkills = [{type: "dodge", value: dodgeScore},
                              {type: "parry", value: parryScore},
                              {type: "block", value: blockScore}].sort(function(a, b)
  {
    return a.value - b.value;
  });

  result.attackRoll = dice.RN();
  result.defenceRoll = dice.RN();
  result.totalAttackRoll = result.attackRoll + attackScore;
  result.baseDefenceRoll = result.defenceRoll + (nbrOfConsecutiveAttacks * 10);
  result.firstDefence = result.baseDefenceRoll + orderedDefenceSkills[0].value;
  result.secondDefence = result.firstDefence + orderedDefenceSkills[1].value;
  result.thirdDefence = result.secondDefence + orderedDefenceSkills[2].value;

  //attack manages to go through all defences
  if (result.totalAttackRoll - result.thirdDefence > 0)
  {
    result.success = true;
    result.outcome = result.totalAttackRoll - result.thirdDefence;
  }

  else if (result.totalAttackRoll - result.firstDefence <= 0)
  {
    result.successfulDefenceType = orderedDefenceSkills[0].type;
    result.outcome = result.totalAttackRoll - result.firstDefence;
  }

  else if (result.totalAttackRoll - result.secondDefence <= 0)
  {
    result.successfulDefenceType = orderedDefenceSkills[1].type;
    result.outcome = result.totalAttackRoll - result.secondDefence;
  }

  else /*if (result.totalAttackRoll - result.thirdDefence <= 0)*/
  {
    result.successfulDefenceType = orderedDefenceSkills[2].type;
    result.outcome = result.totalAttackRoll - result.thirdDefence;
  }

  return result;
};

module.exports.lethality = function(attackOutcome, weaponDamage, effectiveStrength)
{
  return attackOutcome + weaponDamage + effectiveStrength;
};

//if a bodypart is internal (like the heart), then the resistance of the region
//containing it (the thorax) is added
module.exports.bodypartToughness = function(bodypart, bodypartResistance, partProtection)
{
  if (bodypart.isInternal === true)
  {
    return bodypart.region.resistance + bodypartResistance + partProtection;
  }

  else return bodypartResistance + partProtection;
};

module.exports.injuryGravity = function(letality, bodypartToughness)
{
  var gravity = lethality - bodypartToughness;

  if (gravity <= 0)
  {
    return "unscathed";
  }

  else if (gravity <= 50)
  {
    return "minor";
  }

  else if (gravity <= 100)
  {
    return "moderate";
  }

  else return "critical";
};
