
var damageStrategy = require("./damage.js");
var area = require("./area.js");

module.exports =
{
  apply: function(pack, result)
  {
    var heatAuraWeapon =
    {
      name: "Heat Aura",
      damage: 0,
      damageTypes: ["fire"],
      properties: ["magical", "noStrength", "stun"]
    };

    var auras = 0;

    for (var i = 0; i < pack.characters.length; i++)
    {
      if (pack.characters[i].id === pack.actor.id)
      {
        continue;
      }

      if (pack.characters[i].abilities.heatAura == null)
      {
        continue;
      }

      var damageScore = (pack.characters[i].abilities.heatAura - area.distance(pack.actor.battle.position, pack.characters[i].battle.position)).lowerCap(0);

      if (damageScore <= 0)
      {
        continue;
      }

      auras++;
      heatAuraWeapon.damage += (pack.characters[i].abilities.heatAura - area.distance(pack.actor.battle.position, pack.characters[i].battle.position)).lowerCap(0);
    }

    if (heatAuraWeapon.damage <= 0)
    {
      //no heat auras where the actor stands
      return;
    }

    result.nbrOfAuras = auras;
    damageStrategy.apply(heatAuraWeapon, {actor: null, target: pack.actor, data: {}}, result);
  }
}
