
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
    var encumbrance = pack.actor.getTotalAttribute(keys.ENC);

    if (encumbrance <= 0)
    {
      return;
    }

    pack.actor.addFatigue(encumbrance);
    result[keys.FAT] = encumbrance;
  }
}
