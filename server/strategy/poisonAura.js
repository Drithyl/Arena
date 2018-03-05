
var damageStrategy = require("./damage.js");
var area = require("./area.js");

module.exports =
{
  apply: function(pack, result)
  {
    var poisonAuraWeapon =
    {
      name: "Cold Aura",
      damage: 0,
      damageTypes: ["poison"],
      properties: ["magical", "noStrength"]
    };

    var auras = 0;

    for (var i = 0; i < pack.characters.length; i++)
    {
      if (pack.characters[i].id === pack.actor.id)
      {
        continue;
      }

      if (pack.characters[i].abilities.poisonAura == null)
      {
        continue;
      }

      var damageScore = (pack.characters[i].abilities.poisonAura - area.distance(pack.actor.battle.position, pack.characters[i].battle.position)).lowerCap(0);

      if (damageScore <= 0)
      {
        continue;
      }

      auras++;

      if (poisonAuraWeapon.damage < damageScore)
      {
        poisonAuraWeapon.damage = damageScore;
      }
    }

    if (poisonAuraWeapon.damage <= 0)
    {
      //no poison auras where the actor stands
      return;
    }

    result.nbrOfAuras = auras;
    damageStrategy.apply(poisonAuraWeapon, {actor: null, target: pack.actor, data: {}}, result);
  }
}
