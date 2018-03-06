
const dice = require("./dice.js");
var content;
var prototype;
var slotList = ["hands", "head", "body", "feet", "miscellaneous"];

module.exports =
{
  init: function(contentModule)
  {
    content = contentModule;
    return this;
  },

  Slots: function(data)
  {
    for (var i = 0; i < slotList.length; i++)
    {
      if (data[slotList[i]] == null)
      {
        continue;
      }

      this[slotList[i]] = {};
      this[slotList[i]].equipped = [];
      this[slotList[i]].free = data[slotList[i]].free;
      this[slotList[i]].total = data[slotList[i]].total;
    }

    return data;
  }
}

prototype = module.exports.Slots.prototype;

prototype.hasEquipped = function(itemID)
{
  for (var key in this)
  {
    var equipped = this[key].equipped;

    for (var i = 0; i < equipped.length; i++)
    {
      var item = equipped[i];

      if (item.id === id)
      {
        return true;
      }
    }
  }

  return false;
}

prototype.timesEquipped = function(itemID)
{
  return this.equippedItems().filter(function(item)
  {
    return item.id === itemID;

  }).length;
}

prototype.equippedItems = function()
{
  var items = [];

  for (var key in this)
  {
    var equipped = this[key].equipped;

    for (var i = 0; i < equipped.length; i++)
    {
      if (equipped[i] != null)
      {
        items.push(equipped[i]);
      }
    }
  }

  return items;
}

prototype.equippedWeapons = function()
{
  var weapons = [];

  for (var key in this)
  {
    var equipped = this[key].equipped;

    for (var i = 0; i < equipped.length; i++)
    {
      var item = equipped[i];

      if (item.damage != null && item.reach != null)
      {
        weapons.push(item);
      }
    }
  }

  return weapons;
}

prototype.hasProperty = function(key)
{
  for (var key in this)
  {
    var equipped = this[key].equipped;

    for (var i = 0; i < equipped.length; i++)
    {
      var item = equipped[i];

      if (item.properties.includes(key) === true)
      {
        return true;
      }
    }
  }

  return false;
}

prototype.getTotalAbility = function(key)
{
  var total = 0;

  for (var key in this)
  {
    var equipped = this[key].equipped;

    for (var i = 0; i < equipped.length; i++)
    {
      if (equipped[i].abilities[key] != null && isNaN(equipped[i].abilities[key]) === false)
      {
        total += equipped[i].abilities[key];
      }
    }
  }

  return total;
}
