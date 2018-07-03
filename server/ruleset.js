
const dice = require("./dice.js");

module.exports.awe = function(actorMoraleScore, targetAweScore)
{
  var result = {success: false};

  result.moraleRoll = dice.DRN() + actorMoraleScore;
  result.aweRoll = dice.DRN() + 10 + targetAweScore;

  if (result.moraleRoll > result.aweRoll)
  {
    result.success = true;
  }

  return result;
};

module.exports.hit = function(attackScore, wieldingPenalty, defenceScore, harassPenalty, parryScore, weaponIsFlail)
{
  var result = {success: false};

  result.attackRoll = dice.DRN();
  result.defenceRoll = dice.DRN();
  result.parry = parryScore;
  result.wieldingPenalty = wieldingPenalty;
  result.totalAttackRoll = result.attackRoll + attackScore - wieldingPenalty;
  result.totalDefenceRoll = result.defenceRoll + defenceScore - harassPenalty;
  result.difference = result.totalAttackRoll - result.totalDefenceRoll;
  result.isShieldHit = false;

  if (parryScore > 0 && weaponIsFlail === true)
  {
    result.difference += 2;
  }

  if (result.difference < 0)
  {
    return;
  }

  else if (result.difference > 0 && result.difference - parryScore < 0)
  {
    result.isShieldHit = true;
  }

  result.success = true;
  return result;
};

module.exports.glamour = function(glamourImages)
{
  var result = {success: false};

  //hit bypasses glamour
  if (Math.floor((Math.random() * 100)) + 1 <= 100 / (1 + glamourImages))
  {
    result.success = true;
    return result;
  }
};

module.exports.displacement = function(displacementScore)
{
  var result = {success: false};

  if (Math.floor((Math.random() * 100)) + 1 > displacementScore)
  {
    result.success = true;
  }

  return result;
};

module.exports.hitLocation = function(weaponReach, attackerSize, targetBody)
{
  var arr = [];
	var maxHeight = weaponReach + attackerSize;

  for (var part in targetBody)
  {
    var weight = targetBody[part].area * targetBody[part].amount;

    for (var i = 0; i < weight; i++)
    {
      arr.push(part);
    }
  }

  return arr[Math.floor((Math.random() * arr.length))];
};

module.exports.ethereal = function(weaponIsMagical)
{
  var result = {success: false};

  if (Math.floor((Math.random() * 100)) + 1 > 75 || weaponIsMagical === true)
  {
    result.success = true;
  }

  return result;
};

module.exports.magicResistanceCheck = function(magicResistanceScore)
{
  var result = {success: false};

  result.penetrationRoll = dice.DRN() + 10;
  result.magicResistanceRoll = dice.DRN() + magicResistanceScore;
  result.difference = result.penetrationRoll - result.magicResistanceRoll;

  if (result.difference >= 0)
  {
    result.success = true;
  }

  return result;
};

module.exports.totalDamageScore = function(damageScore, strengthScore, noStrengthWeapon, wieldingHands = 0)
{
  if (noStrengthWeapon === true)
  {
    return damageScore;
  }

  else if (wieldingHands > 1)
  {
    //two-handers use 125% of strength, so extend this to potential three-handers
    //and more
    return Math.floor(strengthScore * (1 + (0.25 * (wieldingHands - 1))));
  }

  else return damageScore + strengthScore;
};

module.exports.applyElementalResistance = function(totalDamageScore, elementalResistance, damageEffect)
{
  if (damageEffect === "stun")
  {
    return totalDamageScore - (elementalResistance * 2);
  }

  else return totalDamageScore - elementalResistance;
};

module.exports.applyShieldReduction = function(totalDamageScore, shieldProtection, isArmorPiercing, ignoresShields)
{
  if (ignoresShields)
  {
    return totalDamageScore;
  }

  else if (isArmorPiercing === true)
  {
    return totalDamageScore - Math.floor(shieldProtection * 0.5);
  }

  else return totalDamageScore - shieldProtection;
};

module.exports.calculateProtection = function(damageType, partProtectionScore, naturalArmor, invulnerability, isArmorNegating, isArmorPiercing, isMagical)
{
	if (isArmorNegating === true)
	{
		return 0;
	}

  if (isMagical === true)
  {
    //loses invulnerability protection
    invulnerability = 0;
  }

	if (damageType === "pierce")
	{
		partProtectionScore = Math.floor(armor * 0.8);
    naturalArmor = Math.floor(natural * 0.8);
	}

	if (isArmorPiercing === true)
	{
		partProtectionScore = Math.floor(armor * 0.5);
    naturalArmor = Math.floor(natural * 0.5);
	}

	return partProtectionScore + naturalArmor + invulnerability;
};

module.exports.damageRoll = function(modifiedDamageScore, totalPartProtectionScore)
{
  var result = {};

  result.damageRoll = dice.DRN();
  result.protectionRoll = dice.DRN();
  result.totalDamageRoll = result.damageRoll + modifiedDamageScore;
	result.totalProtectionRoll = result.protectionRoll + totalPartProtectionScore;
	result.difference = result.totalDamageRoll - result.totalProtectionRoll;
  result.finalDamage = result.difference;
  return result;
};

module.exports.damageResultModifiers = function(hasTwistFate, hitLocation, damageType, damageEffect, damageDifference, immunityScore, targetMaxHP)
{
  if (hasTwistFate === true)
  {
    return 0;
  }

  if (damageDifference <= 0 || damageEffect === "stun" || damageEffect === "poison")
  {
    return damageDifference;
  }

	if (damageType == "blunt" && (hitLocation == "head" || hitLocation == "eye"))
	{
		damageDifference = Math.floor(damageDifference * 1.5);
	}

	else if (damageType == "slash")
	{
    damageDifference = Math.floor(damageDifference * 1.25);
	}

  if (immunityScore > 0)
  {
    damageDifference = Math.floor(damageDifference * (immunityScore / 100));
  }

  if (hitLocation === "arm" || hitLocation === "leg" || hitLocation === "wing")
	{
		damageDifference = damageDifference.cap(Math.floor(targetMaxHP * 0.5).lowerCap(1));
	}

  return damageDifference;
};
