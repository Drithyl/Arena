
var keys = null;

module.exports =
{
  items: null,
  armors: null,
  consumables: null,
  forms: null,
  trinkets: null,
  weapons: null,

  init: function(data, index)
  {
    this.items = Object.assign({}, data.armors, data.consumables, data.trinkets, data.weapons);
    this.armors = data.armors;
    this.consumables = data.consumables;
    this.forms = data.forms;
    this.trinkets = data.trinkets;
    this.weapons = data.weapons;
    keys = index;
    return this;
  },

  getItems: function(key, value)
  {
    return grabItems(key, value);
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

function grabItems(filters)
{
  if (Array.isArray(filters) === false)
  {
    filters = [filters];
  }

  return module.exports.items.filter(function (item){ return filterFn(item, filters); });
}

function grab(type, filters)
{
  if (Array.isArray(filters) === false)
  {
    filters = [filters];
  }

  return module.exports[type].filter(function (item){ return filterFn(item, filters); });
}

function filterFn(item, filters)
{
  var validFilters = 0;

  for (var i = 0; i < filters.length; i++)
  {
    var key = filters[i].key;
    var value = filters[i].value;

    if (Array.isArray(item[key]) === true && item[key].includes(value) === true)
    {
      validFilters++;
    }

    else if (typeof item[key] === "string" && item[key] === value)
    {
      validFilters++;
    }

    else if (isNaN(item[key]) === false && item[key] === value)
    {
      validFilters++;
    }

    else if (typeof item[key] === "object" && item[key][value] != null)
    {
      validFilters++;
    }

    if (validFilters === filters.length)
    {
      return true;
    }
  }
}
