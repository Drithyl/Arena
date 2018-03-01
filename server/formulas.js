
var keys;

module.exports =
{
  startingPoints: {},
  
  init: function(index)
  {
    keys = index;

    module.exports.startingPoints =
    {
      [keys.MAX_HP]: function(points, hp)
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

      [keys.STR]: function(points, strength)
      {
        return strength + points;
      },

      [keys.MR]: function(points, mr)
      {
        return mr + points;
      },

      [keys.MRL]: function(points, morale)
      {
        return morale + (points * 2);
      }
    }

    return this;
  }
}
