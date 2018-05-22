

module.exports.resolve = function(actor, targetPosition, weapons, map, ruleset)
{
  var results = [];
  var currentWeapon;
  var targets;

  //TODO check AP requirement

  while (weapons.length > 1)
  {
    currentWeapon = weapons.shift();
    targets = map.getCharactersWithin(targetPosition, weapon.getAbility("areaOfEffect"));

    targets.forEach(function(target, index)
    {
      results.push(apply(actor, target, currentWeapon, map, ruleset));
    });
  }

  return results;
}

function apply(actor, target, weapon, ruleset, map)
{
  var result = {target: target};
  var otherResults = [];

  try
  {
    ruleset.canAffect(actor, target, weapon);
  }

  catch(error)
  {
    result.error = error;
    return result;
  }

  //TODO: actor.apLeft -= ;

  if (target.getTotalAbility("awe") != null)
  {
    result.awe = ruleset.awe(actor, target);

    if (result.awe.success === false)
    {
      return result;
    }
  }

  result.hit = ruleset.hit(actor, target, weapon);

  if (result.hit.success === false)
  {
    return result;
  }

  if (target.hasProperty("glamour") === true)
  {
    result.glamour = ruleset.glamour(target);

    if (result.glamour.success === false)
    {
      return result;
    }
  }

  if (target.getTotalAbility("displacement") != null)
  {
    result.displacement = ruleset.displacement(target);

    if (result.displacement.success === false)
    {
      return result;
    }
  }

  if (target.getTotalAbility("fireShield") != null && subStrategies["fireShield"] != null)
  {
    otherResults.push(subStrategies["fireShield"].resolve(target, actor, map, ruleset));
  }

  if (target.hasProperty("ethereal") === true && weapon.hasProperty("magical") === false)
  {
    result.ethereal = ruleset.ethereal(target);

    if (result.ethereal.success === false)
    {
      return result;
    }
  }

  if (target.getTotalAbility("poisonBarbs") != null && subStrategies["poisonBarbs"] != null)
  {
    otherResults.push(subStrategies["poisonBarbs"].resolve(target, actor, map, ruleset));
  }

  if (target.getTotalAbility("poisonSkin") != null && subStrategies["poisonSkin"] != null && weapon.hasCategory("Natural") === true)
  {
    otherResults.push(subStrategies["poisonSkin"].resolve(actor, ruleset));
  }

  if (weapon.hasProperty("magicResistanceNegates") === true)
  {
    result.mrCheck = ruleset.mrCheck(target);

    if (result.mrCheck.success === false)
    {
      return [result].concat(otherResults);
    }
  }

  result.damageCheck = ruleset.damageCheck(actor, target, weapon, result.hit.location, result.hit.isShieldHit);
  result.damage = ruleset.applyDamage(target, result.damageCheck.damageType, result.damageCheck.damageEffect, result.damageCheck.finalDamage);

  if (result.damageCheck.success === true && (actor.getTotalAbility("drain") > 0 || weapon.getAbility("drain") > 0))
  {
    result.drain = ruleset.drain(actor, weapon, ruleset.damage.damageInflicted);
  }

  if (result.damageCheck.success === true && result.damage.targetKO === false && target.getTotalAbility("berserk") > 0)
  {
    result.berserk = ruleset.berserk(target);
  }

  //TODO: ON HIT AND ON DAMAGE EFFECTS

  if (weapon.canCleave === true && result.damage.damageLeft > 0 && subStrategies["cleave"] != null &&
     (result.damage.damageType === "pierce" || result.damage.damageType === "blunt" || result.damage.damageType === "slash"))
  {
    otherResults.concat(subStrategies["cleave"].resolve(actor, target, weapon, result.damage.damageLeft, map, ruleset));
  }

  result.fatigue = ruleset.fatigue(actor);

  return [result].concat(otherResults);
}
