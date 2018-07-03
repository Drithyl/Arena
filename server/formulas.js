
module.exports =
{
  maxHP: function(points, baseHP)
  {
    for (var i = 0; i < points; i++)
    {
      var gain = Math.round((Math.log(baseHP) / Math.log(2)));

      if (gain < 3)
      {
        baseHP += 3;
      }

      else baseHP += gain;
    }

    return baseHP;
  },

  strength: function(points, baseStrength)
  {
    return baseStrength + points;
  },

  magicResistance: function(points, baseMagicResistance)
  {
    return baseMagicResistance + points;
  },

  morale: function(points, baseMorale)
  {
    return baseMorale + (points * 2);
}
