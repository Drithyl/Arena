
module.exports =
{
  apply: function(pack, result)
  {
    if (pack.target.hasProperty("glamour") === false)
    {
      return;
    }

    result.success = false;

    //hit bypasses glamour
    if (Math.floor((Math.random() * 100)) + 1 <= 100 / (1 + pack.target.battle.status.glamour))
		{
      result.success = true;
      return;
    }

		pack.target.battle.status.glamour--;

		if (pack.target.battle.status.glamour <= 0)
		{
			delete pack.target.battle.status.glamour;
		}
  }
}
