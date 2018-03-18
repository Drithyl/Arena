
const dice = require("./dice.js");
var limbDmgCap = 0.5;

module.exports =
{
  apply: function(pack, result)
  {
    var weapon = pack.data.currentWeapon;
    result.success = false;

    damageCheck(weapon, pack, result);

    if (result.finalDamage <= 0)
    {
      return;
    }

    if (pack.target.battle.status.twistFate != null)
    {
      result.twistFate = true;
      delete pack.target.battle.status.twistFate;
      return;
    }

    result.success = true;
  	inflictDamage(pack, result, weapon.properties.includes("stun"));

    if (pack.data.canAfflict === true)
    {
      affliction.apply(weapon, pack, result);
    }

    if (pack.target.currentHP <= 0)
    {
      result.targetKO = true;
    }
  }
}

function preRollDamage(weapon, pack, result)
{
  var resistance = pack.target.getElementalResistance(result.damageType);
  result.damageScore = weapon.damage;

  if (weapon.properties.includes("noStrength") === false)
  {
    if (weapon.requiredSlots > 1 && weapon.slotType === "hands")
    {
      //two-handers use 125% of strength, so extend this to potential three-handers
      //and more
      result.damageScore += Math.floor(pack.actor.getTotalAttribute("strength") * (1 + (0.25 * (weapon.requiredSlots - 1))));
    }

    else result.damageScore += pack.actor.getTotalAttribute("strength");
  }

  if (weapon.properties.includes("stun") === true)
  {
    resistance *= 2;
  }

  result.damageScore -= resistance;

  if (pack.data.isShieldHit === true && weapon.properties.includes("armorPiercing") === true)
  {
    result.damageScore -= Math.floor(pack.target.getTotalAbility("shieldProtection") / 2);
  }

  else if (pack.data.isShieldHit === true && weapon.properties.includes("ignoreShields") === false)
  {
    result.damageScore -= pack.target.getTotalAbility("shieldProtection");
  }
}

function damageCheck(weapon, pack, result)
{
  result.damageType = weapon.damageTypes[Math.floor(Math.random() * weapon.damageTypes.length)];
  pack.data.damageType = result.damageType;
  preRollDamage(weapon, pack, result);

  if (result.damageScore <= 0)
  {
    result.damageScore = 0;
    pack.data.damageScore =0;
  }

	if (result.damageType == "web")
	{
		result.damageScore = data.actor.size() + weapon.damage;
    pack.data.damageScore = result.damageScore;
    return;
	}

  result.damageRoll = dice.DRN() + result.damageScore;
	result.protectionRoll = pack.target.getProtectionRoll(weapon, target, pack.data.hitLocation, result.damageType);
	result.difference = result.damageRoll - result.protectionRoll;

  if (weapon.properties.includes("stun") === false && result.damageType != "stun" && result.damageType != "poison")
  {
    postRollDamage(pack, result);
  }

  else
  {
    result.finalDamage = result.difference;
    pack.data.finalDamage = result.finalDamage;
  }
}

function postRollDamage(pack, result)
{
	var maxLimbDmg = Math.floor(pack.target.maxHP * 0.5).lowerCap(1);
  result.finalDamage = result.difference;

  if (result.finalDamage <= 0)
  {
    pack.data.finalDamage = 0;
    return;
  }

	if (result.damageType == "blunt" && (result.hitLocation == "head" || result.hitLocation == "eye"))
	{
		result.finalDamage = Math.floor(result.finalDamage * 1.5);
	}

	else if (result.damageType == "slash")
	{
    result.finalDamage = Math.floor(result.finalDamage * 1.25);
	}

  if (result.damageType == "blunt" && pack.target.abilities.bluntImmunity != null)
  {
    result.finalDamage = Math.floor(result.finalDamage * (pack.target.abilities.bluntImmunity / 100));
  }

  else if (result.damageType == "pierce" && pack.target.abilities.pierceImmunity != null)
  {
    result.finalDamage = Math.floor(result.finalDamage * (pack.target.abilities.pierceImmunity / 100));
  }

  else if (result.damageType == "slash" && pack.target.abilities.slashImmunity != null)
  {
    result.finalDamage = Math.floor(result.finalDamage * (pack.target.abilities.slashImmunity / 100));
  }

	if (result.hitLocation == "arm" || result.hitLocation == "leg" || result.hitLocation == "wing")
	{
		result.finalDamage = result.finalDamage.cap(maxLimbDmg);
	}

  pack.data.finalDamage = result.finalDamage;
}

function inflictDamage(pack, result, isStun)
{
  if (type == "web")
	{
		pack.target.battle.status.web = pack.data.finalDamage;
    pack.data.damageInflicted = pack.data.finalDamage;
    return;
	}

	else if (type == "stun" || isStun === true)
	{
    var res = pack.target.addFatigue(pack.data.finalDamage);
    result.damageInflicted = res.fatigueDamage;
    result.fatigueInflicted = res.fatigueAdded;
    pack.data.damageInflicted = result.damageInflicted;
    pack.data.fatigueInflicted = result.damageInflicted;
    return;
	}

	else if (type == "poison")
	{
		pack.target.battle.status.poison = ((pack.target.battle.status.poison || 0) + pack.data.finalDamage).cap(Math.floor(pack.target.maxHP));
    result.damageInflicted = pack.target.battle.status.poison - pack.data.finalDamage;
    pack.data.damageInflicted = result.damageInflicted;
    return;
	}

	else if (type == "paralysis")
	{
		result.damageInflicted = calculateParalysis(pack.data.finalDamage, pack.target);
    pack.data.damageInflicted = result.damageInflicted;

		if (result.damageInflicted > 0)
		{
			pack.target.battle.status.paralysis = pack.target.battle.status.paralysis + result.damageInflicted || result.damageInflicted;
		}

    return;
	}

  else if (type == "cold" || type == "fire")
	{
    pack.data.ignited = pack.target.ignite(pack, result);
	}

  result.damageInflicted = pack.target.reduceHP(pack.data.finalDamage);
  pack.data.damageInflicted = result.damageInflicted;
  pack.data.canAfflict = true;
}

function calculateParalysis(damage, target)
{
  var ttl = Math.floor((damage - target.size()) * 0.5);

  if (target.battle.status.paralysis != null)
  {
    if (target.battle.status.paralysis > ttl)
    {
      ttl = Math.floor(target.status.paralysis * 0.5).cap(5);
    }

    else Math.floor(ttl * 0.5).cap(5);
  }

  return ttl;
}
