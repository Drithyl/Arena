
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
    if (pack.target[keys.AB_LIST][keys.ABS.BERSERK] == null)
    {
      return;
    }

    if (pack.target.battle.status[keys.ABS.BERSERK]] != null)
    {
      //already berserked
      return;
    }

		result.moraleRoll = dice.DRN() + pack.target.getTotalMorale(true);
		result.difficulty = dice.DRN() + 12;

    if (result.moraleRoll < result.difficulty)
    {
      result.triggered = false;
      return;
    }

		pack.target.battle.status[keys.ABS.BERSERK]] = pack.target[keys.AB_LIST][keys.ABS.BERSERK];
    result.triggered = true;
  }
}
