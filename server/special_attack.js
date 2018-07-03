
var ruleset;

module.exports.init = function(rules)
{
  ruleset = rules;
  return this;
};

module.exports.resolve = function(context, callerSequence, self, map, events)
{
  var results;
  var target = context.actor;
  var specialAttack = self.getSpecialAbility("");
  var damageTypeUsed = specialAttack.chooseDamageType();
  var distance = map.distanceToReach(target.id, self.id);

  if (weapon.reach < distance)
  {
    return;
  }

  if (specialAttack.hasProperty("requiresLife") === true && target.hasProperty("lifeless") === true)
  {
    return;
  }

  if (specialAttack.hasProperty("requiresMind") === true && target.hasProperty("mindless") === true)
  {
    return;
  }

  if (specialAttack.getAbility("distanceLowersDamage") > 0)
  {
    //weapon long enough that fire shield does not affect it
    specialAttack.damage -= distance * specialAttack.getAbility("distanceLowersDamage");

    if (specialAttack.damage <= 0)
    {
      return;
    }
  }

  else if (specialAttack.getAbility("distanceRaisesDamage") > 0)
  {
    //weapon long enough that fire shield does not affect it
    specialAttack.damage += (specialAttack.reach - distance) * specialAttack.getAbility("distanceRaisesDamage");
  }

  results = context.createSequence(target, specialAttack, "specialAttack");

  if (specialAttack.hasProperty("noHit") === false)
  {
    results.addResult("hit", ruleset.hit(specialAttack.attack, 0,
                                         target.getTotalAttribute("defence"),
                                         target.getStatusEffect("harassment"),
                                         target.getTotalAttribute("parry"),
                                         specialAttack.hasProperty("flail")));

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
  }

  if (target.getTotalAbility("displacement") != null)
  {
    results.addResult("displacement", ruleset.displacement(target.getTotalAbility("displacement")));

    if (results.displacement.success === false)
    {
      return;
    }
  }

  if (specialAttack.hasProperty("noHit") === false)
  {
    results.addResult("hitLocation", ruleset.hitLocation(specialAttack.reach, self.size, target.bodyparts));

    //Hit (where the blow would land where the target is) happens here
    events.onHit(results, self, target, map, ruleset);
    events.onHitReceived(results, self, target, map, ruleset);

    if (target.hasProperty("ethereal") === true)
    {
      results.addResult("ethereal", ruleset.ethereal(specialAttack.hasProperty("magical")));

      if (results.ethereal.success === false)
      {
        return;
      }
    }
  }

  if (specialAttack.hasProperty("magicResistanceNegates") === true)
  {
    results.addResult("mrCheck", ruleset.mrCheck(target.getTotalAttribute("magicResistance")));

    if (results.mrCheck.success === false)
    {
      return;
    }
  }

  var damageScore = ruleset.totalDamageScore(specialAttack.damage, target.getTotalAttribute("strength"), specialAttack.hasProperty("noStrength"), wieldingHands);
  var shieldedDamageScore = ruleset.applyShieldReduction(damageScore, target.getShieldProtection(), weapon.hasProperty("armorPiercing"), specialAttack.hasProperty("ignoresShields"));
  var resistedDamageScore = ruleset.applyElementalResistance(shieldedDamageScore, target.getElementalResistance(damageTypeUsed), specialAttack.damageEffect);

  var protection = ruleset.calculateProtection(damageTypeUsed,
                                               target.getPartProtection(results.hitLocation),
                                               target.getTotalNaturalArmor(),
                                               target.getTotalAbility("invulnerability"),
                                               specialAttack.hasProperty("armorNegating"),
                                               specialAttack.hasProperty("armorPiercing"),
                                               specialAttack.hasProperty("magical"));

  results.addResult("damageCheck", ruleset.damageRoll(resistedDamageScore, protection));
  results.damageCheck.finalDamage = ruleset.damageResultModifiers(target.getStatusEffect("twistFate"),
                                                                  results.hitLocation,
                                                                  damageTypeUsed,
                                                                  specialAttack.damageEffect,
                                                                  results.damageCheck.difference,
                                                                  target.getDamageImmunity(damageTypeUsed),
                                                                  target.getTotalAttribute("maxHP"));


  results.addResult("damage", target.applyDamage(results.damageCheck.finalDamage, specialAttack.damageEffect, damageTypeUsed));

  //Damage happens here (drain, berserk, etc.)
  events.onDamage(results, self, target, map, ruleset);
  events.onDamageReceived(results, self, target, map, ruleset);

  //attack ended, things such as a cleave happen here
  events.onAttackEnd(context, results, self, target, map, ruleset);

  results.addResult("fatigue", target.applyFatigue(target.getTotalAttribute("encumbrance")));

  return result;
}
