
var keys;
var etherealChance = 75;

module.exports =
{
  init: function(index)
  {
    keys = index;
    return this;
  },

  apply: function(pack, result)
  {
    if (pack.target[keys.PROP_LIST][keys.PROPS.ETHEREAL] == null)
    {
      return;
    }

    if (Math.floor((Math.random() * 100)) + 1 <= etherealChance)
    {
      result.failed = true;
    }
  }
}
