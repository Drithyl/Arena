
module.exports =
{
  apply: function(pack, result)
  {
    var encumbrance = pack.actor.getTotalAttribute("encumbrance");

    if (encumbrance <= 0)
    {
      return;
    }

    pack.actor.addFatigue(encumbrance);
    result.fatigue = encumbrance;
  }
}
