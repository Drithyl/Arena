
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
    if (pack.target[keys.AB_LIST][keys.ABS.DISPLACEMENT] == null)
    {
      return;
    }

    if (Math.floor((Math.random() * 100)) + 1 <= pack.target[keys.AB_LIST][keys.ABS.DISPLACEMENT])
    {
      result.failed = true;
    }
  }
}
