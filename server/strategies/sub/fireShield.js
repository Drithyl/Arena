
module.exports.resolve = function(context, callerSequence, self, map, ruleset, events)
{
  var results;
  var target = context.actor;
  var fireShieldWeapon = self.getSpecialAbility("fireShield");

  if (fireShieldWeapon.getAbility("distanceLowersDamage") > 0)
  {
    //weapon long enough that fire shield does not affect it
    fireShieldWeapon.damage -= map.distanceToReach(target.id, self.id) * fireShieldWeapon.getAbility("distanceLowersDamage");

    if (fireShieldWeapon.damage <= 0)
    {
      return;
    }
  }

  else if (fireShieldWeapon.getAbility("distanceRaisesDamage") > 0)
  {
    //weapon long enough that fire shield does not affect it
    fireShieldWeapon.damage += (fireShieldWeapon.reach - map.distanceToReach(target.id, self.id)) * fireShieldWeapon.getAbility("distanceRaisesDamage");
  }

  results = context.createSequence(target, fireShieldWeapon, "onHitReceived");

	//fireShieldWeapon.damage = target.abilities.fireShield - distance;

  if (target.getTotalAbility("displacement") != null)
  {
    results.addResult("displacement", ruleset.displacement(target.getTotalAbility("displacement")));

    if (results.displacement.success === false)
    {
      return;
    }
  }

  var damageScore = ruleset.totalDamageScore(fireShieldWeapon.damage, target.getTotalAttribute("strength"), fireShieldWeapon.hasProperty("noStrength"), wieldingHands);
  var shieldedDamageScore = ruleset.applyShieldReduction(damageScore, target.getShieldProtection(), weapon.hasProperty("armorPiercing"), fireShieldWeapon.hasProperty("ignoresShields"));
  var resistedDamageScore = ruleset.applyElementalResistance(shieldedDamageScore, target.getElementalResistance(damageTypeUsed), fireShieldWeapon.damageEffect);

  var protection = ruleset.calculateProtection(damageTypeUsed,
                                               target.getPartProtection(results.hitLocation),
                                               target.getTotalNaturalArmor(),
                                               target.getTotalAbility("invulnerability"),
                                               fireShieldWeapon.hasProperty("armorNegating"),
                                               fireShieldWeapon.hasProperty("armorPiercing"),
                                               fireShieldWeapon.hasProperty("magical"));

  results.addResult("damageCheck", ruleset.damageRoll(resistedDamageScore, protection));
  results.damageCheck.finalDamage = ruleset.damageResultModifiers(target.getStatusEffect("twistFate"),
                                                                  results.hitLocation,
                                                                  damageTypeUsed,
                                                                  fireShieldWeapon.damageEffect,
                                                                  results.damageCheck.difference,
                                                                  target.getDamageImmunity(damageTypeUsed),
                                                                  target.getTotalAttribute("maxHP"));


  results.addResult("damage", target.applyDamage(results.damageCheck.finalDamage, fireShieldWeapon.damageEffect, damageTypeUsed));

  //Damage happens here (drain, berserk, etc.)
  events.onDamage(results, self, target, map, ruleset);
  events.onDamageReceived(results, self, target, map, ruleset);

  //attack ended, things such as a cleave happen here
  events.onAttackEnd(context, results, self, target, map, ruleset);

  results.addResult("fatigue", target.applyFatigue(target.getTotalAttribute("encumbrance")));

  return result;
}
