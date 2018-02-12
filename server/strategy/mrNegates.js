
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
		if (weapon[keys.PROP_LIST].includes(keys.PROPS.MR_NEGATE) === false)
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
