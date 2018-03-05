
module.exports =
{
  apply: function(pack, result)
  {
		if (weapon.properties.includes("mrNegates") === false)
		{
			return;
		}

		result.penetrationRoll = dice.DRN() + 10;
		result.mrRoll = dice.DRN() + pack.target.getTotalMR();
		result.difference = result.penetrationRoll - result.mrRoll;

		if (result.difference < 0)
		{
			result.fail = true;
			return;
		}
  }
}
