
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
    if (pack.target[keys.PROP_LIST].includes(keys.PROPS.GLAMOUR) === false)
    {
      return;
    }

    //hit bypasses glamour
    if (Math.floor((Math.random() * 100)) + 1 <= 100 / (1 + pack.target.battle.status[keys.PROPS.GLAMOUR]))
		{
      return;
    }

		result.failed = true;
		pack.target.battle.status[keys.PROPS.GLAMOUR]--;

		if (pack.target.battle.status[keys.PROPS.GLAMOUR] <= 0)
		{
			delete pack.target.battle.status[keys.PROPS.GLAMOUR];
		}
  }
}
