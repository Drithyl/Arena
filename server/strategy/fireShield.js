
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
    var fireShieldWeapon =
    {
      [keys.NAME] = "Fire Shield",
      [keys.DMG] = 0,
      [keys.DMG_TYPE_LIST] = [[keys.DMG_TYPE.FIRE]],
      [keys.PROP_LIST] = [[keys.PROPS.MAGICAL], [keys.NO_STR]]
    }

    if (pack.target[keys.AB_LIST][keys.ABS.FIRE_SHLD] == null)
    {
      return;
    }

    if (pack.data.currentWeapon[keys.LEN] >= pack.target[keys.AB_LIST][keys.ABS.FIRE_SHLD])
    {
      //weapon long enough that fire shield does not affect it
      return;
    }

		fireShieldWeapon[keys.DMG] = pack.target[keys.AB_LIST][keys.ABS.FIRE_SHLD] - pack.data.currentWeapon[keys.LEN];

    //the data passed to the damage arc has to be rebuilt with only the actor and target so that
    //data that would normally carry on won't override the data of the original attack by the actor,
    //since fire shield resolves like a separate attack, on top of the fact that the actor and target
    //have to be swapped, since it's the original actor being targeted now
    damageStrategy.apply(fireShieldWeapon, {actor: pack.target, target: pack.actor, data: {}}, result);
  }
}
