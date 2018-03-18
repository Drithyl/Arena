
module.exports =
{
  apply: function(data, result)
  {
    if (pack.target.abilities.displacement == null)
    {
      return;
    }

    result.success = false;

    if (Math.floor((Math.random() * 100)) + 1 > pack.target.abilities.displacement)
    {
      result.success = true;
    }
  }
}
