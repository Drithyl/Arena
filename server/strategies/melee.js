
var ruleset;

module.exports.init = function(rules)
{
  ruleset = rules;
  return this;
};

module.exports.resolve = function(context, map, events)
{
  var results = [];
  var currentWeaponSlot;
  var targets;

  //TODO check AP requirement

  while (context.weapons.length > 1)
  {
    currentWeaponSlot = context.weapons.shift();
    targets = map.getCharactersWithin(context.targetPosition, currentWeaponSlot.equipped.getAbility("areaOfEffect"));

    targets.forEach(function(target, index)
    {
      results.push(apply(context, target, currentWeaponSlot.equipped, currentWeaponSlot.slotsTaken.length, map, ruleset, events));
    });
  }

  return results;
}

function apply(context, target, weapon, wieldingHands, map, events)
{
  var results = context.createSequence(target, weapon, "melee");
  var damageTypeUsed = weapon.chooseDamageType();

  if (weapon.reach < context.actor.distanceToReach(target))
  {
    results.addResult("error", "This weapon does not have enough range to hit this target.");
    return;
  }

  if (weaponRequiresLife === true && target.hasProperty("lifeless") === true)
  {
    results.addResult("error", "This weapon does not work against lifeless targets.");
    return;
  }

  if (weaponRequiresMind === true && target.hasProperty("mindless") === true)
  {
    results.addResult("error", "This weapon does not work against mindless targets.");
    return;
  }

  //TODO: actor.apLeft -= ;

  if (target.getTotalAbility("awe") != null)
  {
    results.addResult("awe", ruleset.awe(context.actor.getTotalAttribute("morale"), target.getTotalAbility("awe")));

    if (results.awe.success === false)
    {
      return;
    }
  }

  results.addResult("hit", ruleset.hit(context.actor.getTotalAttribute("attack", weapon),
                                       context.actor.getWieldingPenalty(),
                                       target.getTotalAttribute("defence"),
                                       target.getStatusEffect("harassment"),
                                       target.getTotalAttribute("parry"),
                                       weapon.hasProperty("flail")));

  //TODO add this attack to the consecutive attacks from the same attacker

  if (results.hit.success === false)
  {
    return result;
  }

  if (target.hasProperty("glamour") === true)
  {
    results.addResult("glamour", ruleset.glamour(target.getStatusEffect("glamour")));

    if (results.glamour.success === false)
    {
      return;
    }
  }

  if (target.getTotalAbility("displacement") != null)
  {
    results.addResult("displacement", ruleset.displacement(target.getTotalAbility("displacement")));

    if (results.displacement.success === false)
    {
      return;
    }
  }

  results.addResult("hitLocation", ruleset.hitLocation(weapon.reach, context.actor.size, target.bodyparts));

  //Hit (where the blow would land where the target is) happens here
  events.onHit(results, actor, target, map);
  events.onHitReceived(results, actor, target, map);

  if (target.hasProperty("ethereal") === true)
  {
    results.addResult("ethereal", ruleset.ethereal(weapon.hasProperty("magical")));

    if (results.ethereal.success === false)
    {
      return;
    }
  }

  //Impact happens here
  events.onImpact(results, actor, target, map);
  events.onImpactReceived(results, actor, target, map);

  if (weapon.hasProperty("magicResistanceNegates") === true)
  {
    results.addResult("mrCheck", ruleset.mrCheck(target.getTotalAttribute("magicResistance")));

    if (results.mrCheck.success === false)
    {
      return;
    }
  }

  var damageScore = ruleset.totalDamageScore(weapon.damage, context.actor.getTotalAttribute("strength"), weapon.hasProperty("noStrength"), wieldingHands);
  var shieldedDamageScore = ruleset.applyShieldReduction(damageScore, target.getShieldProtection(), weapon.hasProperty("armorPiercing"), weapon.hasProperty("ignoresShields"));
  var resistedDamageScore = ruleset.applyElementalResistance(shieldedDamageScore, target.getElementalResistance(damageTypeUsed), weapon.damageEffect);

  var protection = ruleset.calculateProtection(damageTypeUsed,
                                               target.getPartProtection(results.hitLocation),
                                               target.getTotalNaturalArmor(),
                                               target.getTotalAbility("invulnerability"),
                                               weapon.hasProperty("armorNegating"),
                                               weapon.hasProperty("armorPiercing"),
                                               weapon.hasProperty("magical"));

  results.addResult("damageCheck", ruleset.damageRoll(resistedDamageScore, protection));
  results.damageCheck.finalDamage = ruleset.damageResultModifiers(target.getStatusEffect("twistFate"),
                                                                  results.hitLocation,
                                                                  damageTypeUsed,
                                                                  weapon.damageEffect,
                                                                  results.damageCheck.difference,
                                                                  target.getDamageImmunity(damageTypeUsed),
                                                                  target.getTotalAttribute("maxHP"));


  results.addResult("damage", target.applyDamage(results.damageCheck.finalDamage, weapon.damageEffect, damageTypeUsed));

  //Damage happens here (drain, berserk, etc.)
  events.onDamage(results, actor, target, map);
  events.onDamageReceived(results, actor, target, map);

  //attack ended, things such as a cleave happen here
  events.onAttackEnd(context, results, actor, target, map);

  results.addResult("fatigue", context.actor.applyFatigue(context.actor.getTotalAttribute("encumbrance")));
}
