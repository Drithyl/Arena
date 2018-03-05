
var damageStrategy = require("./damage.js");
var area = require("./area.js");

module.exports =
{
  apply: function(pack, result)
  {
    var coldAuraWeapon =
    {
      name: "Cold Aura",
      damage: 0,
      damageTypes: ["cold"],
      properties: ["magical", "noStrength", "stun"]
    };

    var auras = 0;

    for (var i = 0; i < pack.characters.length; i++)
    {
      if (pack.characters[i].id === pack.actor.id)
      {
        continue;
      }

      if (pack.characters[i].abilities.coldAura == null)
      {
        continue;
      }

      var damageScore = (pack.characters[i].abilities.coldAura - area.distance(pack.actor.battle.position, pack.characters[i].battle.position)).lowerCap(0);

      if (damageScore <= 0)
      {
        continue;
      }

      auras++;
      coldAuraWeapon.damage += (pack.characters[i].abilities.coldAura - area.distance(pack.actor.battle.position, pack.characters[i].battle.position)).lowerCap(0);
    }

    if (coldAuraWeapon.damage <= 0)
    {
      //no cold auras where the actor stands
      return;
    }

    result.nbrOfAuras = auras;
    damageStrategy.apply(coldAuraWeapon, {actor: null, target: pack.actor, data: {}}, result);
  }
}
