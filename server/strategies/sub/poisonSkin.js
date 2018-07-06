
const weaponModule = require("./weapon.js");

module.exports.resolve = function(target, ruleset)
{
  var result = {strategy: "poisonSkin", target: target};

  var poisonSkinWeapon = weaponModule.create(
  {
    id: "poisonSkin",
    name: "Poison Skin",
    damage: 20,
    reach: 1,
    damageTypes: ["poison"],
    properties: ["noStrength"]
  });

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

  result.damage = ruleset.damage(actor, target, poisonSkinWeapon, "body", false);

  if (result.damage.success === true && result.damage.targetKO === false && target.getTotalAbility("berserk") != null)
  {
    result.berserk = ruleset.berserk(target);
  }

  return result;
}
