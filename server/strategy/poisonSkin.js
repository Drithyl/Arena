
var keys;
var damageStrategy;

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
    var poisonSkinWeapon =
    {
      [keys.NAME] = "Poison Skin",
      [keys.DMG] = 20,
      [keys.LEN] = 1,
      [keys.DMG_TYPE_LIST] = [[keys.DMG_TYPE.POISON]],
      [keys.PROP_LIST] = null
    }

    if (pack.target[keys.AB_LIST][keys.ABS.POISON_SKIN] == null)
    {
      return;
    }

    if (pack.distance > poisonSkinWeapon[keys.LEN])
    {
      //distance long enough that barbs can't hit
      return;
    }

    //the data passed to the damage arc has to be rebuilt with only the actor and target so that
    //data that would normally carry on won't override the data of the original attack by the actor,
    //since poison skin resolves like a separate attack, on top of the fact that the actor and target
    //have to be swapped, since it's the original actor being targeted now
		damageStrategy.apply(poisonSkinWeapon, {actor: pack.target, target: pack.actor, data: {}}, result);
  }
}
