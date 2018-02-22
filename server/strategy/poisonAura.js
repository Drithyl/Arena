
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
    var poisonAuraWeapon =
    {
      [keys.NAME] = "Cold Aura",
      [keys.DMG] = 0,
      [keys.DMG_TYPE_LIST] = [[keys.DMG_TYPE.POISON]],
      [keys.PROP_LIST] = [[keys.PROPS.MAGICAL], [keys.NO_STR]]
    };

    var auras = 0;

    for (var i = 0; i < pack.characters.length; i++)
    {
      if (pack.characters[i][keys.ID] === pack.actor[keys.ID])
      {
        continue;
      }

      if (pack.characters[i][keys.AB_LIST][keys.ABS.AURA.POISON] == null)
      {
        continue;
      }

      var damageScore = (pack.characters[i][keys.AB_LIST][keys.ABS.AURA.POISON] - area.distance(pack.actor.battle.position, pack.characters[i].battle.position)).lowerCap(0);

      if (damageScore <= 0)
      {
        continue;
      }

      auras++;

      if (poisonAuraWeapon[keys.DMG] < damageScore)
      {
        poisonAuraWeapon[keys.DMG] = damageScore;
      }
    }

    if (poisonAuraWeapon[keys.DMG] <= 0)
    {
      //no poison auras where the actor stands
      return;
    }

    result.nbrOfAuras = auras;
    damageStrategy.apply(poisonAuraWeapon, {actor: null, target: pack.actor, data: {}}, result);
  }
}
