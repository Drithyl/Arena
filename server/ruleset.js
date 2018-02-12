
const fs = require('fs');
const dice = require("./dice.js");
const order = require("./resolution_orders.json");
var strategies = [];
var keys;

var limbDmgCap = 0.5;
var counterThreshold = 5;

module.exports =
{
  init: function(index)
  {
    keys = index;

    for (var i = 0; i < order.attack.length; i++)
    {
      strategies.push(require("./server/strategies/" + order.attack[i] + ".js").init(keys));
    }
  },

  melee: function(pack)
  {
    var results = [];
    pack.data.nbrAttacks = 0;

    for (var i = 0; i < pack.weapons.length; i++)
    {
      results.push({});
      pack.data.nbrAttacks++;
      pack.data.currentWeapon = data.weapons[i];

      for (var j = 0; j < order.attack.length; j++)
      {
        strategies[j].apply(pack, results[i]);

        if (results[i].failed === true)
        {
          break;
        }
      }

      var encumbrance = pack.data.actor.getTotalEncumbrance();
      pack.data.actor.addFatigue(encumbrance);
      results.push({fatigue: encumbrance});
    }

    return results;
  }
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
