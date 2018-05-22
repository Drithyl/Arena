
module.exports.resolve = function(actor, originalTarget, weapon, damageLeft, map, ruleset)
{
  var cleaveTargets;
  var targetPosition;
  var result = {strategy: "cleave", damageLeft: damageLeft};
  var otherResults = [];

  /************************
  *   DETERMINE TARGET    *
  ************************/

  cleaveTargets = map.getNearbyCharacters(originalTarget.id, actor.size).filter(function(target)
  {
    return map.distanceToReach(actor.id, target.id) <= weapon.reach;
  });

  if (cleaveTargets.length < 1)
  {
    return [];
  }

  result.target = cleaveTargets[Math.floor(Math.random() * cleaveTargets.length)];
  targetPosition = map.getCharacterPosition(result.target.id);


  /****************************************************************************
  *   OBSOLETE CODE, MIGHT ADD LATER TO DISTINGUISH THRUSTING FROM SWINGING   *
  *
  *   else if (damageType === "pierce")
  *   {
  *     cleaveTargets = map.getOppositeAdjacentCharacters(actor.id, originalTarget.id, weapon.reach);
  *
  *     if (cleaveTargets.length < 1)
  *     {
  *       return [];
  *     }
  *   }
  *
  *   else if (damageType === "blunt" || damageType === "slash")
  *   {
  *     cleaveTargets = map.getSideAdjacentCharacters(actor.id, originalTarget.id, weapon.reach);
  *
  *     if (cleaveTargets.length < 1)
  *     {
  *       return [];
  *     }
  *   }
  ****************************************************************************/


  /**********************************
  *   START RESOLUTION OF CLEAVE    *
  **********************************/

  try
  {
    ruleset.canAffect(actor, result.target, weapon);
  }

  catch(error)
  {
    result.error = error;
    return result;
  }

  //TODO: actor.apLeft -= ;

  result.hit = ruleset.hit(actor, result.target, weapon);

  if (result.hit.success === false)
  {
    return result;
  }

  if (result.target.hasProperty("glamour") === true)
  {
    result.glamour = ruleset.glamour(result.target);

    if (result.glamour.success === false)
    {
      return result;
    }
  }

  if (result.target.getTotalAbility("displacement") != null)
  {
    result.displacement = ruleset.displacement(result.target);

    if (result.displacement.success === false)
    {
      return result;
    }
  }

  if (result.target.getTotalAbility("fireShield") != null && subStrategies["fireShield"] != null)
  {
    otherResults.push(subStrategies["fireShield"].resolve(result.target, actor, map, ruleset));
  }

  if (result.target.hasProperty("ethereal") === true && weapon.hasProperty("magical") === false)
  {
    result.ethereal = ruleset.ethereal(result.target);

    if (result.ethereal.success === false)
    {
      return result;
    }
  }

  if (result.target.getTotalAbility("poisonBarbs") != null && subStrategies["poisonBarbs"] != null)
  {
    otherResults.push(subStrategies["poisonBarbs"].resolve(result.target, actor, map, ruleset));
  }

  if (result.target.getTotalAbility("poisonSkin") != null && subStrategies["poisonSkin"] != null && weapon.hasCategory("Natural") === true)
  {
    otherResults.push(subStrategies["poisonSkin"].resolve(actor, ruleset));
  }

  if (weapon.hasProperty("magicResistanceNegates") === true)
  {
    result.mrCheck = ruleset.mrCheck(result.target);

    if (result.mrCheck.success === false)
    {
      return [result].concat(otherResults);
    }
  }

  result.damageCheck = ruleset.damageCheck(actor, result.target, weapon, result.hit.location, result.hit.isShieldHit);
  result.damageCheck.finalDamage -= result.damageCheck.damageRoll - actor.getTotalAttribute("strength");

  if (result.damageCheck.finalDamage <= 0)
  {
    result.damageCheck.success = false;
    return [result].concat(otherResults);
  }

  result.damage = ruleset.applyDamage(result.target, result.damageCheck.damageType, result.damageCheck.damageEffect, result.damageCheck.finalDamage);

  if (result.damageCheck.success === true && (actor.getTotalAbility("drain") > 0 || weapon.getAbility("drain") > 0))
  {
    result.drain = ruleset.drain(actor, weapon, ruleset.damage.damageInflicted);
  }

  if (result.damageCheck.success === true && result.damage.targetKO === false && result.target.getTotalAbility("berserk") > 0)
  {
    result.berserk = ruleset.berserk(result.target);
  }

  return [result].concat(otherResults);
}
