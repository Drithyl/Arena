
var ruleset;

module.exports.init = function(rules)
{
  ruleset = rules;
  return this;
};


module.exports.resolve = function(context, callerSequence, damageLeft, map, events)
{
  var results;
  var cleaveTargets;
  var targetPosition;

  /************************
  *   DETERMINE TARGET    *
  ************************/

  cleaveTargets = map.getNearbyCharacters(callerSequence.target.id, context.actor.size).filter(function(target)
  {
    return map.distanceToReach(context.actor.id, callerSequence.target.id) <= callerSequence.weapon.reach;
  });

  if (cleaveTargets.length < 1)
  {
    return [];
  }

  results = context.createSequence(cleaveTargets[Math.floor(Math.random() * cleaveTargets.length)], callerSequence.weapon, "cleave");
  targetPosition = map.getCharacterPosition(results.target.id);


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

  var damageTypeUsed = results.weapon.chooseDamageType();

  if (results.weapon.reach < context.actor.distanceToReach(results.target))
  {
    results.addResult("error", "This weapon does not have enough range to hit this target.");
    return;
  }

  if (weaponRequiresLife === true && results.target.hasProperty("lifeless") === true)
  {
    results.addResult("error", "This weapon does not work against lifeless targets.");
    return;
  }

  if (weaponRequiresMind === true && results.target.hasProperty("mindless") === true)
  {
    results.addResult("error", "This weapon does not work against mindless targets.");
    return;
  }

  //TODO: actor.apLeft -= ;

  results.addResult("hit", ruleset.hit(context.actor.getTotalAttribute("attack", results.weapon),
                                       context.actor.getWieldingPenalty(),
                                       results.target.getTotalAttribute("defence"),
                                       results.target.getStatusEffect("harassment"),
                                       results.target.getTotalAttribute("parry"),
                                       results.weapon.hasProperty("flail")));

  if (results.hit.success === false)
  {
    return result;
  }

  if (results.target.hasProperty("glamour") === true)
  {
    results.addResult("glamour", ruleset.glamour(results.target.getStatusEffect("glamour")));

    if (results.glamour.success === false)
    {
      return;
    }
  }

  if (results.target.getTotalAbility("displacement") != null)
  {
    results.addResult("displacement", ruleset.displacement(results.target.getTotalAbility("displacement")));

    if (results.displacement.success === false)
    {
      return;
    }
  }

  results.addResult("hitLocation", ruleset.hitLocation(results.weapon.reach, context.actor.size, target.bodyparts));

  //Hit (where the blow would land where the target is) happens here
  events.onHit(results, actor, results.target, map, ruleset);
  events.onHitReceived(results, actor, results.target, map, ruleset);

  if (results.target.hasProperty("ethereal") === true)
  {
    results.addResult("ethereal", ruleset.ethereal(results.weapon.hasProperty("magical")));

    if (results.ethereal.success === false)
    {
      return;
    }
  }

  //Impact happens here
  events.onImpact(results, actor, results.target, map, ruleset);
  events.onImpactReceived(results, actor, results.target, map, ruleset);

  if (results.weapon.hasProperty("magicResistanceNegates") === true)
  {
    results.addResult("mrCheck", ruleset.mrCheck(results.target.getTotalAttribute("magicResistance")));

    if (results.mrCheck.success === false)
    {
      return;
    }
  }

  var damageScore = ruleset.totalDamageScore(results.weapon.damage, context.actor.getTotalAttribute("strength"), results.weapon.hasProperty("noStrength"), wieldingHands);
  var shieldedDamageScore = ruleset.applyShieldReduction(damageScore, results.target.getShieldProtection(), results.weapon.hasProperty("armorPiercing"), results.weapon.hasProperty("ignoresShields"));
  var resistedDamageScore = ruleset.applyElementalResistance(shieldedDamageScore, target.getElementalResistance(damageTypeUsed), results.weapon.damageEffect);

  var protection = ruleset.calculateProtection(damageTypeUsed,
                                               results.target.getPartProtection(results.hitLocation),
                                               results.target.getTotalNaturalArmor(),
                                               results.target.getTotalAbility("invulnerability"),
                                               results.weapon.hasProperty("armorNegating"),
                                               results.weapon.hasProperty("armorPiercing"),
                                               results.weapon.hasProperty("magical"));

  results.addResult("damageCheck", ruleset.damageRoll(resistedDamageScore, protection));
  results.damageCheck.finalDamage = ruleset.damageResultModifiers(results.target.getStatusEffect("twistFate"),
                                                                  results.hitLocation,
                                                                  damageTypeUsed,
                                                                  results.weapon.damageEffect,
                                                                  results.damageCheck.difference,
                                                                  results.target.getDamageImmunity(damageTypeUsed),
                                                                  results.target.getTotalAttribute("maxHP"));


  results.addResult("damage", results.target.applyDamage(results.damageCheck.finalDamage, results.weapon.damageEffect, damageTypeUsed));

  //Damage happens here (drain, berserk, etc.)
  events.onDamage(results, actor, results.target, map, ruleset);
  events.onDamageReceived(results, actor, results.target, map, ruleset);

  //attack ended, things such as a cleave happen here
  events.onCleaveEnd(context, results, actor, results.target, map, ruleset);
}
