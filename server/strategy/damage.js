
var keys;
const dice = require("./dice.js");
var limbDmgCap = 0.5;

module.exports =
{
  init: function(index)
  {
    keys = index;
    return this;
  },

  apply: function(pack, result)
  {
    var weapon = pack.data.currentWeapon;
    
    damageCheck(weapon, pack, result);

    if (result.finalDamage <= 0)
    {
      result.failed = true;
      return;
    }

    if (pack.target.battle.status[keys.PROPS.TWIST_FATE] != null)
    {
      result.twistFate = true;
      result.failed = true;
      delete pack.target.battle.status[keys.PROPS.TWIST_FATE];
      return;
    }

  	inflictDamage(pack, result, (weapon[ids.PROPS][ids.STUN]) ? true : false);

    if (pack.data.canAfflict === true)
    {
      affliction.apply(weapon, pack, result);
    }

    //TODO On Damage effect happens here
    if (pack.data.currentWeapon[keys.ON_DMG] != null && pack.data.currentWeapon[keys.ON_DMG].length > 0)
    {

    }

    //TODO Check if KO happens
    if (pack.target[keys.CURR_HP] <= 0)
    {
      result.targetKO = true;
    }
  }
}

function preRollDamage(weapon, pack, result)
{
  var resistance = pack.target.getElementalResistance(result.damageType);
  result.damageScore = weapon[keys.DMG];

  if (weapon[keys.PROP_LIST].includes(keys.PROPS.NO_STR) === false)
  {
    if (weapon[keys.REQ_SLOTS] > 1 && weapon[keys.SLOT_TYPE] === keys.SLOTS.HANDS)
    {
      //two-handers use 125% of strength, so extend this to potential three-handers
      //and more
      result.damageScore += Math.floor(pack.actor.getTotalAttribute(keys.STR) * (1 + (0.25 * (weapon[keys.REQ_SLOTS] - 1))));
    }

    else result.damageScore += pack.actor.getTotalAttribute(keys.STR);
  }

  if (weapon[keys.PROP_LIST].includes(keys.PROPS.STUN) === true)
  {
    resistance *= 2;
  }

  result.damageScore -= resistance;

  if (pack.data.isShieldHit === true && weapon[keys.PROP_LIST].includes(keys.A_PIERCE) === true)
  {
    result.damageScore -= Math.floor(pack.target.getTotalAbility(keys.SHLD_PRT) / 2);
  }

  else if (pack.data.isShieldHit === true && weapon[keys.PROP_LIST].includes(keys.IGNORES_SHIELD) === false)
  {
    result.damageScore -= pack.target.getTotalAbility(keys.SHLD_PRT);
  }
}

function damageCheck(weapon, pack, result)
{
  result.damageType = weapon[keys.DMG_TYPE_LIST][Math.floor(Math.random() * weapon[keys.DMG_TYPE_LIST].length)];
  pack.data.damageType = result.damageType;
  preRollDamage(weapon, pack, result);

  if (result.damageScore <= 0)
  {
    result.finalDamage = result.damageScore;
    pack.data.finalDamage = result.finalDamage;
    return;
  }

	if (result.damageType == keys.DMG_TYPE.WEB)
	{
		result.finalDamage = data.actor[keys.SIZE];
    pack.data.finalDamage = result.finalDamage;
    return;
	}

  result.damageRoll = dice.DRN() + result.damageScore;
	result.protectionRoll = getProtectionRoll(weapon, target, pack.data.hitLocation, result.damageType, t);
	result.difference = result.damageRoll - result.protectionRoll;

  if (weapon[keys.PROP_LIST].includes([keys.PROPS.STUN]) === false && result.damageType != keys.DMG_TYPE.STUN && result.damageType != keys.DMG_TYPE.POISON)
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
	var maxLimbDmg = Math.floor(pack.target[keys.MAX_HP] * 0.5).lowerCap(1);
  result.finalDamage = result.difference;

  if (result.finalDamage <= 0)
  {
    pack.data.finalDamage = 0;
    return;
  }

	if (result.damageType == keys.DMG_TYPE.BLUNT && (result.hitLocation == keys.PARTS.HEAD || result.hitLocation == keys.PARTS.EYE))
	{
		result.finalDamage = Math.floor(result.finalDamage * 1.5);
	}

	else if (result.damageType == keys.DMG_TYPE.SLASH)
	{
    result.finalDamage = Math.floor(result.finalDamage * 1.25);
	}

  if (result.damageType == keys.DMG_TYPE.BLUNT && pack.target[keys.AB_LIST][keys.ABS.BLUNT] != null)
  {
    result.finalDamage = Math.floor(result.finalDamage * (pack.target[keys.AB_LIST][keys.ABS.BLUNT] / 100));
  }

  else if (result.damageType == keys.DMG_TYPE.PIERCE && pack.target[keys.AB_LIST][keys.ABS.PIERCE] != null)
  {
    result.finalDamage = Math.floor(result.finalDamage * (pack.target[keys.AB_LIST][keys.ABS.PIERCE] / 100));
  }

  else if (result.damageType == keys.DMG_TYPE.SLASH && pack.target[keys.AB_LIST][keys.ABS.SLASH] != null)
  {
    result.finalDamage = Math.floor(result.finalDamage * (pack.target[keys.AB_LIST][keys.ABS.SLASH] / 100));
  }

	if (result.hitLocation == keys.PARTS.ARM || result.hitLocation == keys.PARTS.LEG || result.hitLocation == keys.PARTS.WING)
	{
		result.finalDamage = result.finalDamage.cap(maxLimbDmg);
	}

  pack.data.finalDamage = result.finalDamage;
}

function inflictDamage(pack, result, isStun)
{
  if (type == keys.DMG_TYPE.WEB)
	{
		pack.target.battle.status[keys.DMG_TYPE.WEB] = pack.data.finalDamage;
	}

	else if (type == keys.DMG_TYPE.STUN || isStun === true)
	{
    var res = pack.target.addFatigue(pack.data.finalDamage);
    result.damageInflicted = res.fatigueDamage;
    result.fatigueInflicted = res.fatigueAdded;
	}

	else if (type == keys.DMG_TYPE.POISON)
	{
		pack.target.battle.status[ids.DMG_TYPE.POISON] = ((pack.target.battle.status[ids.DMG_TYPE.POISON] || 0) + pack.data.finalDamage).cap(Math.floor(pack.target[keys.MAX_HP]));
    result.damageInflicted = pack.target.battle.status[ids.DMG_TYPE.POISON] - pack.data.finalDamage;
	}

	else if (type == keys.DMG_TYPE.COLD || type == keys.DMG_TYPE.FIRE)
	{
    Object.assign(result, pack.target.reduceHP(pack.data.finalDamage));
    pack.data.damageInflicted = result.damageInflicted;
    pack.data.canAfflict = true;
    pack.data.ignited = pack.target.ignite(pack, result);
	}

	else if (type == keys.DMG_TYPE.PARALYSIS)
	{
		result.damageInflicted = calculateParalysis(pack.data.finalDamage, pack.target);

		if (result.damageInflicted > 0)
		{
			pack.target.battle.status[keys.DMG_TYPE.PARALYSIS] = pack.target.battle.status[keys.DMG_TYPE.PARALYSIS] + result.damageInflicted || result.damageInflicted;
		}
	}

	else
	{
    Object.assign(result, pack.target.reduceHP(pack.data.finalDamage));
    pack.data.damageInflicted = result.damageInflicted;
    pack.data.canAfflict = true;
	}
}

function calculateParalysis(damage, target)
{
  var ttl = Math.floor((damage - target[keys.SIZE]) * 0.5);

  if (target.battle.status[keys.DMG_TYPE.PARALYSIS] != null)
  {
    if (target.battle.status[keys.DMG_TYPE.PARALYSIS] > ttl)
    {
      ttl = Math.floor(target[ids.STATUS][ids.PARALYZED] * 0.5).cap(5);
    }

    else Math.floor(ttl * 0.5).cap(5);
  }

  return ttl;
}
