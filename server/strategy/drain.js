
module.exports =
{
  apply: function(pack, result)
  {
    var drainRate = ((pack.actor.abilities.drain || 0) +
                    (pack.data.currentWeapon.effects.drain || 0)) / 100;

    if (drainRate <= 0)
    {
      return;
    }

  	result.hpDrain = Math.floor(pack.data.damageInflicted * drainRate);
  	result.fatigueDrain = result.hpDrain * 2;
    pack.actor.heal(result.hpDrain);
    pack.actor.reduceFatigue(result.fatigueDrain);
  }
}
