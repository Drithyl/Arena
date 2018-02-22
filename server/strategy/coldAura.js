
var keys;
var damageStrategy;
var area = require("./area.js");

module.exports =
{
  init: function(index)
  {
    keys = index;
    damageStrategy = require("./damage.js").init(keys);
    return this;
  },

  apply: function(pack, result)
  {
    var coldAuraWeapon =
    {
      [keys.NAME] = "Cold Aura",
      [keys.DMG] = 0,
      [keys.DMG_TYPE_LIST] = [[keys.DMG_TYPE.COLD]],
      [keys.PROP_LIST] = [[keys.PROPS.MAGICAL], [keys.NO_STR], [keys.STUN]]
    };

    var auras = 0;

    for (var i = 0; i < pack.characters.length; i++)
    {
      if (pack.characters[i][keys.ID] === pack.actor[keys.ID])
      {
        continue;
      }

      if (pack.characters[i][keys.AB_LIST][keys.ABS.AURA.COLD] == null)
      {
        continue;
      }

      var damageScore = (pack.characters[i][keys.AB_LIST][keys.ABS.AURA.COLD] - area.distance(pack.actor.battle.position, pack.characters[i].battle.position)).lowerCap(0);

      if (damageScore <= 0)
      {
        continue;
      }

      auras++;
      coldAuraWeapon[keys.DMG] += (pack.characters[i][keys.AB_LIST][keys.ABS.AURA.COLD] - area.distance(pack.actor.battle.position, pack.characters[i].battle.position)).lowerCap(0);
    }

    if (coldAuraWeapon[keys.DMG] <= 0)
    {
      //no cold auras where the actor stands
      return;
    }

    result.nbrOfAuras = auras;
    damageStrategy.apply(coldAuraWeapon, {actor: null, target: pack.actor, data: {}}, result);
  }
}
