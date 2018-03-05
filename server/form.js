
const dice = require("./dice.js");
var content;
var prototype;

module.exports =
{
  init: function(contentModule)
  {
    content = contentModule;
    return this;
  },

  Form: function(data)
  {
    this.name = data.name;
    this.id = data.id;
    this.cost = data.cost;
    this.maxHP = data.maxHP;
    this.mr = data.mr;
    this.morale = data.morale;
    this.strength = data.strength;
    this.attack = data.attack;
    this.defence = data.defence;
    this.precision = data.precision;
    this.ap = data.ap;
    this.paths = data.paths;
    this.properties = data.properties;
    this.abilities = data.abilities;
    this.parts = data.parts;
    this.slots = data.slots;

    return obj;
  }
}

prototype = module.exports.Form.prototype;

prototype.hasProperty = function(key)
{
  if (this.properties.includes(key) === true)
  {
    return true;
  }

  else return false;
}

prototype.getTotalAbility = function(key)
{
  var total = 0;

  for (var ability in this.abilities)
  {
    if (key == ability && isNaN(this.abilities[ability]) === false)
    {
      total += this.abilities[ability];
    }
  }

  return total;
}

prototype.weaponTimesAvailable = function(weaponID)
{
  if (this.naturalWeapons == null || this.naturalWeapons.length < 1)
  {
    return 0;
  }

  return this.naturalWeapons.filter(function(weapon)
  {
    return weapon.id === id
  }).length;
}

prototype.getNaturalWeapon = function(id)
{
  var arr = [];

  if (this.naturalWeapons == null || this.naturalWeapons.length < 1)
  {
    return arr;
  }

  return this.naturalWeapons.filter(function(attack) {  return attack.id === id; });
}

prototype.hasNaturalWeapon = function(id)
{
  if (this.naturalWeapons == null || this.naturalWeapons.length < 1)
  {
    return false;
  }

  if (this.naturalWeapons.filter(function(attack) {  return attack.id === id; }).length < 1)
  {
    return false;
  }

  return true;
}
