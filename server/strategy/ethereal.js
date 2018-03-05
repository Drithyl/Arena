
var etherealChance = 75;

module.exports =
{
  apply: function(pack, result)
  {
    if (pack.target.properties.ethereal == null)
    {
      return;
    }

    if (Math.floor((Math.random() * 100)) + 1 <= etherealChance)
    {
      result.failed = true;
    }
  }
}
