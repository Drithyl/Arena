
const dice = require("./dice.js");
var prototype;
var slotList = ["hands", "head", "body", "feet", "miscellaneous"];

module.exports =
{
  create: function(character, data)
  {
    this.character = character;

    for (var key in character.form.slots)
    {
      if (data == null || data[key] == null)
      {
        this[key] = [];

        for (var i = 0; i < character.form.slots[key]; i++)
        {
          this[key].push({equipped: null, slotsTaken: []});
        }
      }

      else this[key] = data[key];
    }
  }
}

prototype = module.exports.create.prototype;

//returns the free slots of this type,
//which are objects; meaning their properties can
//be altered by reference
prototype.getFree = function(slot)
{
  var freeObjects = [];

  this[slot].forEach(function(item)
  {
    if (item.equipped == null)
    {
      freeObj.push(item);
    }
  });

  return freeObjects;
}

prototype.equip = function(slots, item)
{
  if (item.gripSpace != null && item.gripSpace < this.character.size() * slots.length)
  {
    throw new Error("This weapon doesn't have enough grip space for this many hands of this size!");
  }

  for (var i = 0; i < slots.length; i++)
  {
    if (this[item.slotType][slots[i]] == null)
    {
      throw new Error("No slot " + slots[i] + " of type " + item.slotType + " available.");
    }

    if (this[item.slotType][slots[i]].equipped != null)
    {
      this.emptySlot(item.slotType, slots[i]);
    }

    this[item.slotType][slots[i]].equipped = item;
    this[item.slotType][slots[i]].slotsTaken = slots;
  }
}

prototype.emptySlot = function(type, slot)
{
  if (this[type][slot] == null)
  {
    return;
  }

  for (var i = 0; i < this[type][slot].slotsTaken.length; i++)
  {
    var slotToEmpty = this[type][slot].slotsTaken[i];
    this[type][slotToEmpty].equipped = null;
  }
}

//updates the number of slots available
//based on a new form adopted after a shapeshift
prototype.update = function()
{
  for (var key in this.character.form.slots)
  {
    var charTotal = this.slots[key].length;
    var formTotal = this.character.form.slots[key] || 0;

    if (formTotal === charTotal)
    {
      continue;
    }

    else if (formTotal === 0)
    {
      delete this.slots[key];
    }

    else if (formTotal > charTotal)
    {
      for (var i = 0; i < formTotal - charTotal; i++)
      {
        this.slots[key].push({equipped: null, slotsTaken: []});
      }
    }

    else if (formTotal < charTotal)
    {
      this.slots[key] = this.slots[key].slice(0, charTotal - formTotal);
    }
  }
}

//removes a given item. The slotsTaken property
//is used for items that take up more than one slot,
//like two-hander weapons, to properly clean up everything
prototype.dropItem = function(id, slotType)
{
  for (var i = 0; i < this[slotType].length; i++)
  {
    var item = this[slotType][i].equipped;

    if (item.id === id)
    {
      this.emptySlot(slotType, i);
      return;
    }
  }
}

//checks if a given item is equipped
prototype.hasEquipped = function(id)
{
  for (var key in this)
  {
    for (var i = 0; i < this[key].length; i++)
    {
      var item = this[key][i].equipped;

      if (item.id === id)
      {
        return true;
      }
    }
  }

  return false;
}

//gets a specific item based on an id given
prototype.getItem = function(id)
{
  for (var key in this)
  {
    for (var i = 0; i < this[key].length; i++)
    {
      var item = this[key][i].equipped;

      if (item.id === id)
      {
        return item;
      }
    }
  }

  return null;
}

//returns the amount of times that an item
//is equipped, i.e. if a character is wielding
//multiple weapons of the same kind.
//The slotsChecked array is used to prevent
//counting items that take up more than a single
//slot, like two-handed weapons, multiple times,
//instead of the one. It is reset for each new slot
//type, since an item can't occupy several slots of
//different kinds
prototype.timesEquipped = function(id)
{
  var times = 0;
  var slotsChecked;

  for (var key in this)
  {
    slotsChecked = [];

    for (var i = 0; i < this[key].length; i++)
    {
      var item = this[key][i].equipped;

      if (item == null || item.id !== id || slotsChecked.includes(i) === true)
      {
        continue;
      }

      times++;
      slotsChecked.concat(this[key][i].slotsTaken);
    }
  }

  return times;
}

//The slotsChecked array is used to prevent
//counting items that take up more than a single
//slot, like two-handed weapons, multiple times,
//instead of the one. It is reset for each new slot
//type, since an item can't occupy several slots of
//different kinds
prototype.equippedItems = function()
{
  var items = [];
  var slotsChecked;

  for (var key in this)
  {
    slotsChecked = [];

    for (var i = 0; i < this[key].length; i++)
    {
      if (this[key][i].equipped == null || slotsChecked.includes(i) === true)
      {
        continue;
      }

      items.push(equipped[i]);
      slotsChecked.concat(this[key][i].slotsTaken);
    }
  }

  return items;
}

//The slotsChecked array is used to prevent
//counting items that take up more than a single
//slot, like two-handed weapons, multiple times,
//instead of the one. It is reset for each new slot
//type, since an item can't occupy several slots of
//different kinds
prototype.equippedWeapons = function()
{
  var weapons = [];
  var slotsChecked;

  for (var key in this)
  {
    slotsChecked = [];

    for (var i = 0; i < this[key].length; i++)
    {
      var item = this[key][i].equipped;

      if (item == null || item.damage == null || slotsChecked.includes(i) === true)
      {
        continue;
      }

      weapons.push(equipped[i]);
      slotsChecked.concat(this[key][i].slotsTaken);
    }
  }

  return weapons;
}

//The slotsChecked array is used to prevent
//counting items that take up more than a single
//slot, like two-handed weapons, multiple times,
//instead of the one. It is reset for each new slot
//type, since an item can't occupy several slots of
//different kinds
prototype.getTotalAbility = function(key)
{
  var total = 0;
  var slotsChecked;

  for (var key in this)
  {
    slotsChecked = [];

    for (var i = 0; i < this[key].length; i++)
    {
      var item = this[key][i].equipped;

      if (item == null || isNaN(item.abilities[key]) === true || slotsChecked.includes(i) === true)
      {
        continue;
      }

      total += item.abilities[key];
    }
  }

  return total;
}

prototype.hasProperty = function(key)
{
  for (var key in this)
  {
    for (var i = 0; i < this[key].length; i++)
    {
      var item = this[key][i].equipped;

      if (item != null && item.properties.includes(key) === true)
      {
        return true;
      }
    }
  }

  return false;
}
