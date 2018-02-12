
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
    pack.actor.damageArc(pack.data.currentWeapon, pack, result);
  }
}
