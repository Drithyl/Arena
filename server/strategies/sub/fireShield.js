
const weaponModule = require("./weapon.js");

module.exports.resolve = function(actor, target, map, ruleset)
{
  var result = {strategy: "fireShield", target: target};

  var fireShieldWeapon = weaponModule.create(
  {
    id: "fireShield",
    name: "Fire Shield",
    damage: 0,
    damageTypes: ["fire"],
    properties: ["magical", "noStrength"]
  });

  var distance = map.distanceToReach(actor.id, target.id);

  if (distance > target.abilities.fireShield)
  {
    //weapon long enough that fire shield does not affect it
    return null;
  }

	fireShieldWeapon.damage = target.abilities.fireShield - distance;

  if (target.abilities.displacement != null)
  {
    result.displacement = ruleset.displacement(target);

    if (result.displacement.success === false)
    {
      return result;
    }
  }

  result.damage = ruleset.damage(actor, target, fireShieldWeapon, "body", false);

  if (result.damage.success === true && result.damage.targetKO === false && target.abilities.berserk != null)
  {
    result.berserk = ruleset.berserk(target);
  }

  return result;
}
