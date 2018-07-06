
module.exports =
{
  agility: function(points, baseAgility)
  {
    return baseAgility + points;
  },

  dexterity: function(points, baseDexterity)
  {
    return baseDexterity + points;
  },

  endurance: function(points, baseEndurance)
  {
    return baseEndurance + points;
  },

  magicResistance: function(points, baseMagicResistance)
  {
    return baseMagicResistance + points;
  },

  power: function(points, basePower)
  {
    return basePower + points;
  },

  resilience: function(points, baseResilience)
  {
    return baseResilience + points;
  },

  strength: function(points, baseStrength)
  {
    return baseStrength + points;
  },

  willpower: function(points, baseWillpower)
  {
    return baseWillpower + points;
  }
}
