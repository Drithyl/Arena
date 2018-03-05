
var chanceMultiplier = 25;
var chanceCap = 33;
var severChance = chanceMultiplier * 0.75;
var recuperationChance = 25;

module.exports =
{
  apply: function(pack, result)
  {
    if (pack.data.canAfflict === false)
    {
      return;
    }

    var chance = Math.floor((pack.data.damage / Math.floor(pack.target.maxHP)) * chanceMultiplier).cap(chanceCap);
  	var roll = Math.floor((Math.random() * 100)) + 1;

  }
}
