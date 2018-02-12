
var keys;

module.exports =
{
  init: function(index)
  {
    keys = index;
    return this;
  },

  apply: function(data, result)
  {
    if (data.target.battle.status[keys.PROPS.TWIST_FATE] == null)
		{
      return;
    }

    if (data.damage > 0)
    {
      data.damage = 0;
      delete data.target.battle.status[keys.PROPS.TWIST_FATE];
    }
  }
}
