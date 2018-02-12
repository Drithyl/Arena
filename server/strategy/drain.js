
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
    var drainRate = ((pack.actor[keys.AB_LIST][keys.ABS.DRAIN] || 0) +
                    (pack.data.currentWeapon[keys.EFF_LIST][keys.EFF.DRAIN] || 0)) / 100;

    if (drainRate <= 0)
    {
      return;
    }

  	result.hpDrain = Math.floor(pack.data.damage * drainRate);
  	result.fatigueDrain = result.hpDrain * 2;
    pack.actor.heal(result.hpDrain);
    pack.actor.reduceFatigue(result.fatigueDrain);
  }
}
