
module.exports =
{
  apply: function(pack, result)
  {
    if (pack.target.abilities.awe == null)
    {
      return;
    }

    result.success = false;
    result.moraleRoll = dice.DRN() + getTotalMorale(pack.actor);
    result.aweRoll = dice.DRN() + 10 + pack.target.abilities.awe;

    if (result.moraleRoll > result.aweRoll)
    {
      result.success = true;
    }
  }
}
