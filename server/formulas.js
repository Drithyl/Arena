
module.exports =
{
  maxHP: function(points, hp)
  {
    for (var i = 0; i < points; i++)
    {
      var gain = Math.round((Math.log(hp) / Math.log(2)));

      if (gain < 3)
      {
        hp += 3;
      }

      else hp += gain;
    }

    return hp;
  },

  strength: function(points, strength)
  {
    return strength + points;
  },

  magicResistance: function(points, magicResistance)
  {
    return magicResistance + points;
  },

  morale: function(points, morale)
  {
    return morale + (points * 2);
  }
}
