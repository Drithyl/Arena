
module.exports =
{
  apply: function(pack, result)
  {
    if (pack.target.abilities.berserk == null)
    {
      return;
    }

    if (pack.target.battle.status.berserk != null)
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

		pack.target.battle.status.berserk = pack.target.abilities.berserk;
    result.triggered = true;
  }
}
