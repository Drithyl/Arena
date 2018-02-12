
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
    if (pack.target[keys.AB_LIST][keys.ABS.AWE] == null)
    {
      return;
    }

    result.failed = false;
    result.moraleRoll = dice.DRN() + getTotalMorale(pack.actor);
    result.aweRoll = dice.DRN() + 10 + pack.target[keys.AB_LIST][keys.ABS.AWE];

    if (result.moraleRoll <= result.aweRoll)
    {
      result.failed = true;
    }
  }
}
