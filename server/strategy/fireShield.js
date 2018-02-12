
var keys;

module.exports =
{
  init: function(index)
  {
    keys = index;
    return this;
  },

  apply: function(pack, result)
  {
    var fireShieldDmg;

    if (pack.target[keys.AB_LIST][keys.ABS.FIRE_SHLD] == null)
    {
      return;
    }

    if (pack.data.currentWeapon[keys.LEN] >= pack.target[keys.AB_LIST][keys.ABS.FIRE_SHLD])
    {
      //weapon long enough that fire shield does not affect it
      return;
    }

		fireShieldDmg = pack.target[keys.AB_LIST][keys.ABS.FIRE_SHLD] - pack.data.currentWeapon[keys.LEN];

    //the data passed to the damage arc has to be rebuilt with only the actor and target so that
    //data that would normally carry on won't override the data of the original attack by the actor,
    //since fire shield resolves like a separate attack, on top of the fact that the actor and target
    //have to be swapped, since it's the original actor being targeted now
		pack.actor.damageArc(fireShieldWeapon, {actor: pack.target, target: pack.actor, data: {}}, result);
  }
}
