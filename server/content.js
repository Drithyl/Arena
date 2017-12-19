
var keyIndex = null;

module.exports =
{
  armors: null,
  consumables: null,
  forms: null,
  trinkets: null,
  weapons: null,

  init: function(data, index)
  {
    this.armors = data.armors;
    this.consumables = data.consumables;
    this.forms = data.forms;
    this.trinkets = data.trinkets;
    this.weapons = data.weapons;
    keyIndex = index;
    return this;
  },

  getArmors: function(key, value)
  {
    return grab("armors", key, value);
  },

  getConsumables: function(key, value)
  {
    return grab("consumables", key, value);
  },

  getForms: function(key, value)
  {
    return grab("forms", key, value);
  },

  getTrinkets: function(key, value)
  {
    return grab("trinkets", key, value);
  },

  getWeapons: function(key, value)
  {
    return grab("weapons", key, value);
  }
}

function grab(type, key, value)
{
  if (module.exports.forms == null)
  {
    return null;
  }

  return module.exports[type].filter(function (form){ return form[key].includes(value); });
}
