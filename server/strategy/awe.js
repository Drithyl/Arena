
module.exports =
{
  apply: function(pack, result)
  {
    if (pack.target.abilities.awe == null)
    {
      return;
    }

    result.failed = false;
    result.moraleRoll = dice.DRN() + getTotalMorale(pack.actor);
    result.aweRoll = dice.DRN() + 10 + pack.target.abilities.awe;

    if (result.moraleRoll <= result.aweRoll)
    {
      result.failed = true;
    }
  }
}
