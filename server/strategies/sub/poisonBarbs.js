
module.exports.resolve = function(actor, target, map, ruleset)
{
  var result = {strategy: "poisonBarbs", target: target};

  var poisonBarbsWeapon = weaponModule.create(
  {
    id: "poisonBarbs",
    name: "Poison Barbs",
    damage: 10,
    reach: 3,
    damageTypes: ["poison"],
    properties: ["noStrength"]
  });


  if (map.distanceToReach(actor.id, target.id) > poisonBarbsWeapon.reach)
  {
    //distance long enough that barbs can't hit
    return null;
  }

  if (target.getTotalAbility("displacement") != null)
  {
    result.displacement = ruleset.displacement(target);

    if (result.displacement.success === false)
    {
      return result;
    }
  }

  if (target.hasProperty("ethereal") === true)
  {
    result.ethereal = ruleset.ethereal(target);

    if (result.ethereal.success === false)
    {
      return result;
    }
  }

  result.damage = ruleset.damage(actor, target, poisonBarbsWeapon, "body", false);

  if (result.damage.success === true && result.damage.targetKO === false && target.getTotalAbility("berserk") != null)
  {
    result.berserk = ruleset.berserk(target);
  }

  return result;
}
