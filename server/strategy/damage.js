
var keys;
const dice = require("./dice.js");

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

    if (result.damage < 0)
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
  }
}

function inflictDamage(pack, result, isStun)
{
  if (type == keys.DMG_TYPE.WEB)
	{
		pack.target.battle.status[keys.DMG_TYPE.WEB] = pack.data.damage;
	}

	else if (type == keys.DMG_TYPE.STUN || isStun === true)
	{
    var res = pack.target.addFatigue(pack.data.damage);
    result.damageInflicted = res.fatigueDamage;
    result.fatigueInflicted = res.fatigueAdded;
	}

	else if (type == keys.DMG_TYPE.POISON)
	{
		pack.target.battle.status[ids.DMG_TYPE.POISON] = ((pack.target.battle.status[ids.DMG_TYPE.POISON] || 0) + pack.data.damage).cap(Math.floor(pack.target[keys.MAX_HP]));
    result.damageInflicted = pack.target.battle.status[ids.DMG_TYPE.POISON] - pack.data.damage;
	}

	else if (type == keys.DMG_TYPE.COLD || type == keys.DMG_TYPE.FIRE)
	{
    Object.assign(result, pack.target.reduceHP(pack.data.damage));
    pack.data.damageInflicted = result.damageInflicted;
    pack.data.canAfflict = true;
    pack.data.ignited = pack.target.ignite(pack, result);
	}

	else if (type == keys.DMG_TYPE.PARALYSIS)
	{
		result.damageInflicted = calculateParalysis(pack.data.damage, pack.target);

		if (result.damageInflicted > 0)
		{
			pack.target.battle.status[keys.DMG_TYPE.PARALYSIS] = pack.target.battle.status[keys.DMG_TYPE.PARALYSIS] + result.damageInflicted || result.damageInflicted;
		}
	}

	else
	{
    Object.assign(result, pack.target.reduceHP(pack.data.damage));
    pack.data.damageInflicted = result.damageInflicted;
    pack.data.canAfflict = true;
	}
}

function damageCheck(weapon, pack, result)
{
  result.damageType = weapon.pickDamage();
  pack.data.damageType = result.damageType;

	if (result.damageType == keys.DMG_TYPE.WEB)
	{
		result.damage = data.actor[keys.SIZE];
    pack.data.damage = result.damage;
    return;
	}

  result.damageRoll = (result.damageType != keys.DMG_TYPE.POISON) ? dice.DRN() + weapon[keys.DMG] : weapon[keys.DMG];
	result.protectionRoll = getProtectionRoll(weapon, target, pack.data.hitLocation, result.damageType, t);
	result.difference = result.damageRoll - result.protectionRoll;

	if (weapon[keys.PROP_LIST].includes(keys.PROPS.CAPPED) === true && result.difference > 0)
	{
		result.damage = 1;
    data.pack.damage = 1;
		return;
	}

	modifyDamage(pack, result, (weapon[ids.PROPS][ids.STUN]) ? true : false);
}

function modifyDamage(pack, result, isStun = false)
{
	var maxLimbDmg = Math.floor(pack.target[keys.MAX_HP] * 0.5).lowerCap(1);
  result.damage = result.difference.lowerCap(0);

  if (result.damage <= 0)
  {
    pack.data.damage = 0;
    return;
  }

	if (result.damageType == keys.DMG_TYPE.BLUNT && (result.hitLocation == keys.PARTS.HEAD || result.hitLocation == keys.PARTS.EYE))
	{
		result.damage = Math.floor(result.damage * 1.5);
	}

	else if (result.damageType == keys.DMG_TYPE.SLASH)
	{
    result.damage = Math.floor(result.damage * 1.25);
	}

  if (result.damageType == keys.DMG_TYPE.BLUNT && pack.target[keys.AB_LIST][keys.ABS.BLUNT] != null)
  {
    result.damage = Math.floor(result.damage * (pack.target[keys.AB_LIST][keys.ABS.BLUNT] / 100));
  }

  else if (result.damageType == keys.DMG_TYPE.PIERCE && pack.target[keys.AB_LIST][keys.ABS.PIERCE] != null)
  {
    result.damage = Math.floor(result.damage * (pack.target[keys.AB_LIST][keys.ABS.PIERCE] / 100));
  }

  else if (result.damageType == keys.DMG_TYPE.SLASH && pack.target[keys.AB_LIST][keys.ABS.SLASH] != null)
  {
    result.damage = Math.floor(result.damage * (pack.target[keys.AB_LIST][keys.ABS.SLASH] / 100));
  }

	if ((result.hitLocation == keys.PARTS.ARM || result.hitLocation == keys.PARTS.LEG || result.hitLocation == keys.PARTS.WING) &&
      result.damage > maxLimbDmg && isStun == false && result.damageType != keys.DMG_TYPE.STUN && result.damageType != keys.DMG_TYPE.POISON)
	{
		result.damage = maxLimbDmg;
	}

  pack.data.damage = result.damage;
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
