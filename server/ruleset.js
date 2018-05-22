
const dice = require("./dice.js");
var content;

module.exports =
{
  init: function(contentModule)
  {
    content = contentModule;
    return this;
  },

  canAffect: function(actor, target, weapon)
  {
    if (weapon.range < actor.distanceToReach(target))
    {
      throw new Error("This weapon does not have enough range to hit this target.");
    }

    if (weapon.hasProperty("requiresLife") === true && target.hasProperty("lifeless") === true)
    {
      throw new Error("This weapon does not work against lifeless targets.");
    }

    if (weapon.hasProperty("requiresMind") === true && target.hasProperty("mindless") === true)
    {
      throw new Error("This weapon does not work against mindless targets.");
    }
  },

  awe: function(actor, target)
  {
    var result = {success: false};

    result.moraleRoll = dice.DRN() + actor.getTotalAttribute("morale");
    result.aweRoll = dice.DRN() + 10 + target.getTotalAbility("awe");

    if (result.moraleRoll > result.aweRoll)
    {
      result.success = true;
    }

    return result;
  },

  hit: function(actor, target, weapon)
  {
    var result = {success: false};

    result.parry = target.getTotalAttribute("parry");
    result.dualPenalty = actor.getDualPenalty();
    result.attackRoll = dice.DRN();
    result.defenceRoll = dice.DRN();
  	result.totalAttackRoll = result.attackRoll + actor.getTotalAttack(weapon) - result.dualPenalty;
  	result.totalDefenceRoll = result.defenceRoll + target.getTotalDefence() - target.getStatusEffect("harassment");
    result.difference = result.totalAttackRoll - result.totalDefenceRoll;
    result.location = getHitLocation(weapon.reach, actor.getSize(), target.getBodyparts());
		result.isShieldHit = false;
		target.statusEffects.harassment++;

		if (result.parry > 0 && weapon.properties.includes("flail") === true)
		{
			result.difference += 2;
		}

		if (result.difference < 0)
		{
			return;
		}

		else if (result.difference > 0 && result.difference - result.parry < 0)
		{
			result.isShieldHit = true;
		}

		result.success = true;
    return result;
  },

  glamour: function(target)
  {
    var result = {success: false};

    //hit bypasses glamour
    if (Math.floor((Math.random() * 100)) + 1 <= 100 / (1 + target.statusEffects.glamour))
		{
      result.success = true;
      return result;
    }

    target.setStatusEffect("glamour", target.statusEffects.glamour - 1);

		if (target.statusEffects.glamour <= 0)
		{
      target.setStatusEffect("glamour", "DELETE");
		}

    return result;
  },

  displacement: function(target)
  {
    var result = {success: false};

    if (Math.floor((Math.random() * 100)) + 1 > target.abilities.displacement)
    {
      result.success = true;
    }

    return result;
  },

  ethereal: function(target)
  {
    var result = {success: false};

    if (Math.floor((Math.random() * 100)) + 1 > 75)
    {
      result.success = true;
    }

    return result;
  },

  magicResistanceCheck: function(target)
  {
    var result = {success: false};

		result.penetrationRoll = dice.DRN() + 10;
		result.magicResistanceRoll = dice.DRN() + target.getTotalMR();
		result.difference = result.penetrationRoll - result.magicResistanceRoll;

		if (result.difference >= 0)
		{
			result.success = true;
		}

    return result;
  },

  damageCheck: function(actor, target, weapon, hitLocation, isShieldHit)
  {
    var result = {success: false, targetKO: false};

    preRollModifiers(actor, target, weapon, isShieldHit, result);
    damageRoll(actor, target, weapon, hitLocation, result);
    postRollModifiers(target, hitLocation, result);

    if (result.finalDamage <= 0)
    {
      return result;
    }

    if (target.getStatusEffect("twistFate") != null)
    {
      result.twistFate = true;
      return result;
    }

    return result;
  },

  applyDamage: function(target, type, effect, finalDamage)
  {
    var result = {};

    if (effect === "web")
    {
      result.damageInflicted = finalDamage;
      target.setStatusEffect("web", result.damageInflicted);
    }

    else if (effect === "stun")
    {
      Object.assign(result, module.exports.fatigue(target, finalDamage));
    }

    else if (effect === "poison")
    {
      result.damageInflicted.cap(target.getTotalAttribute("maxHP") - (target.getStatusEffect("poison") || 0));
      target.setStatusEffect("poison", target.getStatusEffect("poison") || 0 + result.damageInflicted);
    }

    else if (effect === "paralysis")
    {
      result.damageInflicted = calculateParalysis(finalDamage, target);
      target.setStatusEffect("paralysis", result.damageInflicted);
    }

    else
    {
      result.damageInflicted = reduceHP(target, finalDamage);

      if (target.currentHP <= 0)
      {
        target.setStatusEffect("ko", true);
        result.targetKO = true;
      }
    }

    if (type === "cold" || type === "fire")
    {
      if (ignites(type, result.damageInflicted) === true)
      {
        result.ignited = true;
        target.setStatusEffect(type, true);
      }
    }

    result.damageLeft = finalDamage - result.damageInflicted;
    return result;
  },

  berserk: function(target)
  {
    var moraleRoll = dice.DRN() + target.getTotalAttribute("morale");
    var difficulty = dice.DRN() + 12;
    var success;

    if (moraleRoll > difficulty)
    {
      success = true;
      target.setStatusEffect("berserk", target.getTotalAbility("berserk"));
    }

    return {moraleRoll: moraleRoll, difficulty: difficulty, success: sucess};
  },

  drain: function(actor, weapon, damageInflicted)
  {
    var drainRate = Math.floor((actor.getTotalAbility("drain") + weapon.getAbility("drain")) * 0.01);
    var hpDrain = Math.floor(damageInflicted * drainRate).cap(actor.getTotalAttribute("maxHP") - actor.currentHP);
    var fatigueDrain = (hpDrain * 2).cap(actor.fatigue);
    var hpHealed;
    var fatigueReduced;

    if (hpDrain > 0)
    {
      hpHealed = healHP(actor, hpDrain);
      fatigueReduced = reduceFatigue(actor, fatigueDrain);
    }

    return {drainRate: drainRate, hpHealed: hpHealed, fatigueReduced: fatigueReduced};
  },

  fatigue: function(actor, amount = actor.getTotalAttribute("encumbrance"))
  {
    var totalFatigue = actor.fatigue + fatigue;
    var fatigueAdded = (totalFatigue - currentFatigue).cap(200);
    var fatigueDamage = Math.floor((totalFatigue - 200) * 0.2);

    if (fatigueAdded > 0)
    {
      actor.fatigue += fatigueAdded;
    }

    if (fatigueDamage > 0)
    {
      reduceHP(actor, fatigueDamage);
    }

    if (actor.fatigue >= 100)
    {
      actor.setStatusEffect("berserk", "DELETE");
    }

    return {fatigueAdded: fatigueAdded, fatigueDamage: fatigueDamage};
  },

  reinvigorate: function(target, amount)
  {
    amount += target.getTotalAbility("reinvigoration");

  	if (target.fatigue >= 100)
  	{
  		amount += 5; //Reinvigorate 5 if it's unconscious
  	}

  	return reduceFatigue(target, amount);
  }
}

function getHitLocation(weaponLength, actorSize, targetParts)
{
	var arr = [];
	var maxHeight = weaponLength + actor.size();

  for (var part in targetParts)
  {
    var weight = partSizes[part].area * targetParts[part];

    for (var i = 0; i < weight; i++)
    {
      arr.push(part);
    }
  }

  return arr[Math.floor((Math.random() * arr.length))];
}

function damageRoll(actor, target, weapon, hitLocation, result)
{
  if (result.damageScore <= 0)
  {
    result.damageScore = 0;
  }

	if (weapon.damageEffect === "web")
	{
		result.damageScore = actor.size() + weapon.damage;
    return;
	}

  result.damageRoll = dice.DRN();
  result.protectionRoll = dice.DRN();
  result.totalDamageRoll = result.damageRoll + result.damageScore;
	result.totalProtectionRoll = result.protectionRoll + getProtectionAgainst(weapon, target, hitLocation, result.damageType);
	result.difference = result.totalDamageRoll - result.totalProtectionRoll;
  result.finalDamage = result.difference;
}

function getProtectionAgainst(weapon, target, hitLocation, damageType)
{
  var armor = target.getTotalArmor(hitLocation);
  var natural = target.getTotalNaturalArmor(hitLocation);
  var invulnerability = target.getTotalAbility("invulnerability");

	if (weapon.hasProperty("armorNegating") === true)
	{
		return 0;
	}

  if (weapon.hasProperty("magical") === true)
  {
    //loses invulnerability protection
    invulnerability = 0;
  }

	if (damageType == "pierce")
	{
		armor = Math.floor(armor * 0.8);
    natural = Math.floor(natural * 0.8);
	}

	if (weapon.hasProperty("armorPiercing") === true)
	{
		armor = Math.floor(armor * 0.5);
    natural = Math.floor(natural * 0.5);
	}

	return armor + natural + invulnerability;
}

function preRollModifiers(actor, target, weapon, isShieldHit, result)
{
  result.damageType = weapon.chooseDamageType();
  result.damageScore = weapon.damage;
  result.damageResistance = target.getElementalResistance(result.damageType);

  if (weapon.hasProperty("noStrength") === false)
  {
    if (weapon.requiredSlots > 1 && weapon.slotType === "hands")
    {
      //two-handers use 125% of strength, so extend this to potential three-handers
      //and more
      result.damageScore += Math.floor(actor.getTotalAttribute("strength") * (1 + (0.25 * (weapon.requiredSlots - 1))));
    }

    else result.damageScore += actor.getTotalAttribute("strength");
  }

  if (weapon.damageEffect === "stun")
  {
    result.damageResistance *= 2;
  }

  result.damageScore -= result.damageResistance;

  if (isShieldHit === true && weapon.hasProperty("armorPiercing") === true)
  {
    result.damageScore -= Math.floor(target.getTotalAbility("shieldProtection") / 2);
  }

  else if (isShieldHit === true && weapon.hasProperty("ignoreShields") === false)
  {
    result.damageScore -= target.getTotalAbility("shieldProtection");
  }
}

function postRollModifiers(target, hitLocation, result)
{
	var maxLimbDmg = Math.floor(target.maxHP * 0.5).lowerCap(1);
  var immunity;

  if (result.damageType === "blunt")
  {
    immunity = target.getTotalAbility("bluntImmunity");
  }

  else if (result.damageType === "pierce")
  {
    immunity = target.getTotalAbility("bluntImmunity");
  }

  else if (result.damageType === "slash")
  {
    immunity = target.getTotalAbility("slashtImmunity");
  }

  if (result.finalDamage <= 0 || weapon.damageEffect === "stun" || result.damageEffect === "poison")
  {
    return;
  }

	if (result.damageType == "blunt" && (hitLocation == "head" || hitLocation == "eye"))
	{
		result.finalDamage = Math.floor(result.finalDamage * 1.5);
	}

	else if (result.damageType == "slash")
	{
    result.finalDamage = Math.floor(result.finalDamage * 1.25);
	}

  if (immunity > 0)
  {
    result.finalDamage = Math.floor(result.finalDamage * (immunity / 100));
  }

	if (hitLocation == "arm" || hitLocation == "leg" || hitLocation == "wing")
	{
		result.finalDamage = result.finalDamage.cap(maxLimbDmg);
	}
}

function calculateParalysis(damage, target)
{
  var total = Math.floor((damage - target.size()) * 0.5);

  if (target.statusEffects.paralysis != null)
  {
    if (target.statusEffects.paralysis > total)
    {
      total = Math.floor(target.statusEffects.paralysis * 0.5).cap(5);
    }

    else Math.floor(total * 0.5).cap(5);
  }

  return total;
}

function ignites(type, finalDamage)
{
  if (type !== "cold" && type !== "fire")
  {
    return false;
  }

  var igniteChance = finalDamage * 5;
	var roll = Math.floor((Math.random() * 100)) + 1;

	if (roll > igniteChance)
	{
		return false;
	}

  return true;
}

function reduceHP(target, amount)
{
  var damageInflicted = amount.cap(target.currentHP);
  var damageRemaining = amount - damageInflicted;
  var nextFormHP;

  while (damageRemaining > 0 && target.isInLastForm === false)
  {
    target.nextForm();
    nextFormHP = target.getTotalAttribute("maxHP");
    damageInflicted += damageRemaining.cap(nextFormHP);

    if (damageRemaining - nextFormHP <= 0)
    {
      //no more damage left, so set the final form's current hp
      target.currentHP = nextFormHP - damageRemaining;
    }

    damageRemaining -= nextFormHP;
  }

  return damageInflicted;
}

function healHP(target, amount)
{
  var maxHP = target.getTotalAttribute("maxHP");
  var damageHealed = amount.cap(maxHP - target.currentHP);
  var healRemaining = amount - damageHealed;

  while (healRemaining > 0 && target.isInFirstForm === false)
  {
    target.previousForm();
    maxHP = target.getTotalAttribute("maxHP");
    damageHealed += healRemaining.cap(maxHP);

    if (healRemaining <= maxHP)
    {
      //no more damage left, so set the final form's current hp
      target.currentHP = healRemaining;
    }

    healRemaining = healRemaining - healRemaining.cap(maxHP);
  }

  return damageHealed;
}

function reduceFatigue(target, amount)
{
  var originalFat;
  var fatigueReduced = amount.cap(target.fatigue);

  if (target.fatigue >= 100 && target.fatigue - fatigueReduced < 100)
  {
    target.setStatusEffect("unconscious", "DELETE");
  }

  target.fatigue -= fatigueReduced;
  return fatigueReduced;
}
