
var slotsModule;
var content;
var prototype;

module.exports =
{
  Character: function(data, formList)
  {
    /**************************
    *   PRIVILEDGED METHODS   *
    **************************/
    /*must go first, since    *
    * function hoisting does  *
    * not work with a function*
    * assignment**************/

    this.toJSON = function()
    {
      var obj =
      {
        name: _name,
        id: _id,
        player: _player,
        maxHP: _maxHP,
        magicResistance: _magicResistance,
        morale: _morale,
        strength: _strength,
        level: _level,
        transitionPoints: _transitionPoints,
        currentHP: _currentHP,
        attack: _attack,
        defence: _defence,
        precision: _precision,
        actionPoints: _actionPoints,
        movementPoints: _movementPoints,
        afflictions: _afflictions,
        paths: _paths,
        properties: _properties,
        abilities: _abilities,
        hands: _hands,
        head: _head,
        body: _body,
        feet: _feet,
        miscellaneous: _miscellaneous,
        formIndex: _formIndex,
        formList: _formList
      };

      obj.slotKeys = ["hands", "head", "body", "feet", "miscellaneous"];

      return obj;
    };

    this.toDatabase = function()
    {
      //uses the toJSON method because the data to be saved in the database is the
      //same one, and toJSON is required for when JSON.stringify() is called on
      //this object
      return this.toJSON();
    };

    this.setEquipment = function(equipment)
    {
      _equipment = equipment;
    };

    this.getStatusEffect = function(status)
    {
      return _statusEffects[status];
    };

    this.setStatusEffect = function(status, value)
    {
      //TODO verify if status is in list of existing ones
      //TODO verify validity of value for existing status
      _statusEffects[status] = value;
      _changes.statusEffects[status] = value;
    };

    this.hasProperty = function(key)
    {
      if (_properties.includes(key) === true)
      {
        return true;
      }

      if (this.form.hasProperty(key) === true)
      {
        return true;
      }

      if (this.hasEquippedProperty(key) === true)
      {
        return true;
      }

      return false;
    };

    this.getAbility = function(key)
    {
      if (_abilities[key] == null || isNaN(_abilities[key]) === true)
      {
        return null;
      }

      else return _abilities[key];
    }

    this.getChanges = function()
    {
      var changes = Object.assign({}, _changes);
      _changes = {};
      return changes;
    };

    this.nextForm = function()
    {
      if (this.isInLastForm === false)
      {
        this.formIndex++;
        this.form = _formList[_formIndex];
        this.slots.update();
      }
    };

    this.previousForm = function()
    {
      if (this.isInFirstForm === false)
      {
        this.formIndex--;
        this.form = _formList[_formIndex];
        this.slots.update();
      }
    };


    /**********************************
    *   EQUIPMENT-RELATED FUNCTIONS   *
    **********************************/

    //returns the free slots of this type,
    //which are objects; meaning their properties can
    //be altered by reference
    this.getFreeSlots = function(slotType)
    {
      var freeSlots = [];

      _slotList[slotType].forEach(function(slot)
      {
        if (slot.equipped == null)
        {
          freeSlots.push(slot);
        }
      });

      return freeSlots;
    };

    this.getEquippedItem = function(slotType, index)
    {
      if (_slotList[slotType] == null || _slotList[slotType][index] == null || _slotList[slotType][index].equipped == null)
      {
        return null;
      }

      return _slotList[slotType][index].equipped;
    }

    this.hasSlot = function(type, index)
    {
      if (_slotList[type] == null)
      {
        return false;
      }

      if (_slotList[type][index] == null)
      {
        return false;
      }

      return true;
    }

    //slots is the number of slots in which to equip the item, it's an array of
    //slot indexes, i.e. which specific slots were designated
    this.equip = function(slots, item)
    {
      if (item.type === "weapon" && item.gripSpace < _character.size() * slots.length)
      {
        throw new Error("This weapon doesn't have enough grip space for this many hands of this size!");
      }

      else if (_slotList[item.slotType].length < item.requiredSlots || _slotList[item.slotType].length < slots.length)
      {
        throw new Error("There aren't enough slots to equip this item.");
      }

      for (var i = 0; i < slots.length; i++)
      {
        if (_slotList[item.slotType][slots[i]].equipped != null)
        {
          unequip(item.slotType, slots[i]);
        }

        _slotList[item.slotType][slots[i]].equipped = item;
        _slotList[item.slotType][slots[i]].slotsTaken = slots;
      }
    };

    //updates the number of slots available
    //based on a new form adopted after a shapeshift
    this.updateSlots = function()
    {
      for (var key in _character.form.slots)
      {
        var charTotal = _slotList[key].length;
        var formTotal = _character.form.slots[key] || 0;

        if (formTotal === charTotal)
        {
          continue;
        }

        else if (formTotal > charTotal)
        {
          createEmptySlots(key, formTotal - charTotal);
        }

        else if (formTotal < charTotal)
        {
          //start removing past the new total of slots, formTotal
          removeSlots(key, formTotal, formTotal - charTotal);
        }
      }
    };

    //removes a given item. The slotsTaken property
    //is used for items that take up more than one slot,
    //like two-hander weapons, to properly clean up everything
    this.unequipItem = function(id, slotType)
    {
      for (var i = 0; i < _slotList[slotType].length; i++)
      {
        var item = _slotList[slotType][i].equipped;

        if (item.id === id)
        {
          unequip(slotType, i);
          return;
        }
      }
    };

    //checks if a given item is equipped
    this.hasEquipped = function(id)
    {
      for (var key in _slotList)
      {
        for (var i = 0; i < _slotList[key].length; i++)
        {
          var item = _slotList[key][i].equipped;

          if (item.id === id)
          {
            return true;
          }
        }
      }

      return false;
    };

    //gets a specific item based on an id given
    this.getItem = function(id)
    {
      for (var key in _slotList)
      {
        for (var i = 0; i < _slotList[key].length; i++)
        {
          var item = _slotList[key][i].equipped;

          if (item.id === id)
          {
            return item;
          }
        }
      }

      return null;
    };

    //returns the amount of times that an item
    //is equipped, i.e. if a character is wielding
    //multiple weapons of the same kind.
    //The slotsChecked array is used to prevent
    //counting items that take up more than a single
    //slot, like two-handed weapons, multiple times,
    //instead of the one. It is reset for each new slot
    //type, since an item can't occupy several slots of
    //different kinds
    this.timesEquipped = function(id)
    {
      var times = 0;
      var slotsChecked;

      for (var key in _slotList)
      {
        slotsChecked = [];

        for (var i = 0; i < _slotList[key].length; i++)
        {
          var item = _slotList[key][i].equipped;

          if (item == null || item.id !== id || slotsChecked.includes(i) === true)
          {
            continue;
          }

          times++;
          slotsChecked.concat(_slotList[key][i].slotsTaken);
        }
      }

      return times;
    };

    //The slotsChecked array is used to prevent
    //counting items that take up more than a single
    //slot, like two-handed weapons, multiple times,
    //instead of the one. It is reset for each new slot
    //type, since an item can't occupy several slots of
    //different kinds
    this.getAllEquippedItems = function()
    {
      var items = [];
      var slotsChecked;

      for (var key in _slotList)
      {
        slotsChecked = [];

        for (var i = 0; i < _slotList[key].length; i++)
        {
          if (_slotList[key][i].equipped == null || slotsChecked.includes(i) === true)
          {
            continue;
          }

          items.push(equipped[i]);
          slotsChecked.concat(_slotList[key][i].slotsTaken);
        }
      }

      return items;
    };

    //The slotsChecked array is used to prevent
    //counting items that take up more than a single
    //slot, like two-handed weapons, multiple times,
    //instead of the one. It is reset for each new slot
    //type, since an item can't occupy several slots of
    //different kinds
    this.getAllEquippedWeapons = function()
    {
      var weapons = [];
      var slotsChecked;

      for (var key in _slotList)
      {
        slotsChecked = [];

        for (var i = 0; i < _slotList[key].length; i++)
        {
          var item = _slotList[key][i].equipped;

          if (item == null || item.type !== "weapon" || slotsChecked.includes(i) === true)
          {
            continue;
          }

          weapons.push(equipped[i]);
          slotsChecked.concat(_slotList[key][i].slotsTaken);
        }
      }

      return weapons;
    };

    //The slotsChecked array is used to prevent
    //counting items that take up more than a single
    //slot, like two-handed weapons, multiple times,
    //instead of the one. It is reset for each new slot
    //type, since an item can't occupy several slots of
    //different kinds
    this.getEquippedAbility = function(key)
    {
      var total;
      var slotsChecked;

      for (var key in _slotList)
      {
        slotsChecked = [];

        for (var i = 0; i < _slotList[key].length; i++)
        {
          var item = _slotList[key][i].equipped;
          var value;

          if (item == null)
          {
            continue;
          }

          value = item.getAbility(key);

          if (value == null)
          {
            continue;
          }

          if (total == null)
          {
            total = value;
          }

          total += value;
        }
      }

      //can be undefined, in which case the item does not have the ability.
      //This is because some abilities might have a zero value.
      return total;
    };


    this.getDualPenalty = function()
    {
      var total = 0;

      for (var key in _slotList)
      {
        var slotType = _slotList[key];

        for (var i = 0; i < slotType.length; i++)
        {
          var item = slotType[i].equipped;

          if (item.type !== "weapon")
          {
            //not a weapon
            continue;
          }

          if (item.hasProperty("extra") === true)
          {
            //"Extra" weapons are bonus weapons that do not
            //add penalty, like natural weapons
            continue;
          }

          total += item.reach;
        }
      }

      return total.lowerCap(0);
    };

    this.getTotalArmor = function(part)
    {
      var total = 0;

      for (var i = 0; i < _slotList[part].length; i++)
      {
        var item = _slotList[part][i].equipped;

        if (item != null)
        {
          total += item.getPartProtection(part);
        }
      }

      return total;
    };

    this.hasEquippedProperty = function(key)
    {
      for (var key in _slotList)
      {
        for (var i = 0; i < _slotList[key].length; i++)
        {
          var item = _slotList[key][i].equipped;

          if (item != null && item.hasProperty(key) === true)
          {
            return true;
          }
        }
      }

      return false;
    };


    //All private members are declared with "var". All public members
    //are declared with this.
    //Required values, whether it's a new character or a revived one
    var _name = data.name;
    var _id = data.id;
    var _player = data.username;
    var _maxHP = data.maxHP;
    var _magicResistance = data.magicResistance;
    var _morale = data.morale;
    var _strength = data.strength;

    //Revived forms list, injected directly here for decoupling
    var _formIndex = data.formIndex || 0;
    var _formList = formList;
    this.form = _formList[_formIndex];

    //Optional values; new characters will only have the default values here,
    //whereas revived characters will load their own
    var _level = data.level || 0;
    var _transitionPoints = data.transitionPoints || 0;
    var _currentHP = data.currentHP || this.getTotalAttribute("maxHP");
    var _attack = data.attack || 0;
    var _defence = data.defence || 0;
    var _precision = data.precision || 0;
    var _actionPoints = data.actionPoints || 0;
    var _movementPoints = data.movementPoints || 0;
    var _afflictions = data.afflictions || null;
    var _paths = data.paths || null;
    var _properties = data.properties || null;
    var _abilities = data.abilities || null;

    //Temporary values (battle-related values) that will always be at a default
    //state when the character is loaded up
    var _fatigue = 0;
    var _statusEffects = {harassment: 0};
    var _actionPointsLeft = this.getTotalAttribute("actionPoints");
    var _movementPointsLeft = this.getTotalAttribute("movementPoints");
    var _changes = {statusEffects: {}};

    var _hands = [];
    var _head = [];
    var _body = [];
    var _feet = [];
    var _miscellaneous = [];
    var _slotList = {hands: _hands, head: _head, body: _body, feet: _feet, miscellaneous: _miscellaneous};

    for (var key in _slotList)
    {
      if (data == null || data[key] == null)
      {
        createEmptySlots(key, this.form.slots[key]);
      }

      else _slotList[key] = data[key];
    }

    /**************************
    *   GETTERS AND SETTERS   *
    **************************/

    Object.defineProperty(this, "id",
    {
      get: function()
      {
        return _id;
      },
      enumerable: true
    });

    Object.defineProperty(this, "name",
    {
      get: function()
      {
        return _name;
      },
      enumerable: true
    });

    Object.defineProperty(this, "player",
    {
      get: function()
      {
        return _player;
      },
      enumerable: true
    });

    Object.defineProperty(this, "size",
    {
      get: function()
      {
        return this.form.size;
      },
      enumerable: true
    });

    Object.defineProperty(this, "sizeType",
    {
      get: function()
      {
        return this.form.sizeType;
      },
      enumerable: true
    });

    Object.defineProperty(this, "maxHP",
    {
      get: function()
      {
        return _maxHP;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _maxHP = Math.floor(value);
          _changes["maxHP"] = _maxHP;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "magicResistance",
    {
      get: function()
      {
        return _magicResistance;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _magicResistance = Math.floor(value);
          _changes["magicResistance"] = _magicResistance;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "morale",
    {
      get: function()
      {
        return _morale;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _morale = Math.floor(value);
          _changes["morale"] = _morale;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "strength",
    {
      get: function()
      {
        return _strength;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _strength = Math.floor(value);
          _changes["strength"] = _strength;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "level",
    {
      get: function()
      {
        return _level;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _level = Math.floor(value);
          _changes["level"] = _level;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "transitionPoints",
    {
      get: function()
      {
        return _transitionPoints;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _transitionPoints = Math.floor(value);
          _changes["transitionPoints"] = _transitionPoints;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "currentHP",
    {
      get: function()
      {
        return _currentHP;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _currentHP = Math.floor(value);
          _changes["currentHP"] = _currentHP;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "attack",
    {
      get: function()
      {
        return _attack;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _attack = Math.floor(value);
          _changes["attack"] = _attack;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "defence",
    {
      get: function()
      {
        return _defence;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _defence = Math.floor(value);
          _changes["defence"] = _defence;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "precision",
    {
      get: function()
      {
        return _precision;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _precision = Math.floor(value);
          _changes["precision"] = _precision;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "actionPoints",
    {
      get: function()
      {
        return _actionPoints;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _actionPoints = Math.floor(value);
          _changes["actionPoints"] = _actionPoints;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "movementPoints",
    {
      get: function()
      {
        return _movementPoints;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _movementPoints = Math.floor(value);
          _changes["movementPoints"] = _movementPoints;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "formIndex",
    {
      get: function()
      {
        return _formIndex;
      },
      set: function(value)
      {
        if (isNaN(value) === false && value > 0 && value < _formList.length)
        {
          _formIndex = Math.floor(value);
          _changes["formIndex"] = _formIndex;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "fatigue",
    {
      get: function()
      {
        return _fatigue;
      },
      set: function(value)
      {
        if (isNaN(value) === false && value > 0 && value < _formList.length)
        {
          _fatigue = Math.floor(value);
          _changes["fatigue"] = _fatigue;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "isInFirstForm",
    {
      get: function()
      {
        if (_formIndex === 0)
        {
          return true;
        }

        else return false;
      },
      enumerable: true
    });

    Object.defineProperty(this, "isInLastForm",
    {
      get: function()
      {
        if (_formIndex === _formList.length - 1)
        {
          return true;
        }

        else return false;
      },
      enumerable: true
    });

    /**********************
    *   PRIVATE METHODS   *
    **********************/

    function createEmptySlots(type, amount)
    {
      if (_slotList[type] == null)
      {
        return;
      }

      for (var i = 0; i < amount; i++)
      {
        _slotList[key].push({equipped: null, slotsTaken: []});
      }
    }

    function removeSlots(type, index, amountToRemove)
    {
      if (_slotList[type] != null)
      {
        _slotList[type].splice(index, amountToRemove);
      }
    }

    function unequip(type, slot)
    {
      if (_slotList[type][slot] == null)
      {
        return;
      }

      for (var i = 0; i < _slotList[type][slot].slotsTaken.length; i++)
      {
        var slotToEmpty = _slotList[type][slot].slotsTaken[i];
        _slotList[type][slotToEmpty].equipped = null;
      }
    }

    module.exports.Character.list.push(this);
  }
}

module.exports.Character.list = [];

module.exports.Character.fromJSON = function(data, revivedEquipment)
{
  var character = new module.exports.Character();
  character.setEquipment();
  return character;
}

prototype = module.exports.Character.prototype;

/**********************
*   PUBLIC METHODS    *
**********************/

//(no access to private variables directly other than through
//the getters and setters defined within the constructor)

prototype.getPublicData = function()
{
  var data = {};
  data.id = this.id;
  data.name = this.name;
  data.player = this.player;
  data.level = this.level;
  data.form = this.form.name;
  data.size = this.size();
  data.sizeType = this.sizeType();
  data.slots = {};

  for (var slot in this.slots)
  {
    data.slots[slot] = {equipped: {}};

    for (var key in this.slots[slot].equipped)
    {
      var item = this.slots[slot].equipped[key];
      data.slots[slot].equipped[key] = item.name;
    }
  }

  return data;
}

//will set a property according to a key path (i.e. 'slots.hands.equipped' will
//reach this.slots.hands.equipped and set the value there). Also registers the
//change in the changes object so that the recent changes can easily be shipped
//to the player client. If the value is "DELETE", it will delete the property.
prototype.set = function(path, value)
{
  var property = this;  // a moving reference to internal objects within this character
  var changedProperty = this.changes;
  var pathList = path.split('.');
  var len = pathList.length;

  for (var i = 0; i < len-1; i++)
  {
    var element = pathList[i];

    if (property[element] == null)
    {
      property[element] = {};
    }

    if (changedProperty[element] == null)
    {
      changedProperty[element] = {};
    }

    property = property[element];
    changedProperty = changedProperty[element];
  }

  if (value === "DELETE")
  {
    delete property[pathList[len-1]];
  }

  else property[pathList[len-1]] = value;
  changedProperty[pathList[len-1]] = value;
};

prototype.getBodyparts = function()
{
  return this.form.parts;
};

prototype.addFatigue = function(amount)
{
  var result = {fatigueAdded: amount.cap(200), fatigueDamage: 0};
  this.set("fatigue", this.fatigue + result.fatigueAdded);

  if (this.fatigue + result.fatigueAdded === 200 && amount > result.fatigueAdded)
  {
    result.fatigueDamage = Math.floor((amount - result.fatigueAdded) / 5);
    this.reduceHP(result.fatigueDamage);
  }

  if (this.fatigue >= 100)
  {
    this.setStatusEffect("berserk", "DELETE");
  }

  return result;
}

prototype.reduceHP = function(damage)
{
  var damageInflicted = damage.cap(this.currentHP);
  this.set("currentHP", damageInflicted);

  if (this.currentHP === 0 && this.formList.length > 0 && this.formIndex < this.formList.length - 1)
  {
    damageInflicted += this.woundedShape(damage - damageInflicted);
  }

  return damageInflicted;
}

prototype.woundedShape = function(damageCarried)
{
  var maxHP;
  var damageInflicted;

  this.set("formIndex", this.formIndex + 1);
  this.set("form", this.formList[this.formIndex]);

  maxHP = this.getTotalAttribute("maxHP");
  damageInflicted = damageCarried.cap(this.currentHP);
  this.reduceHP(damageInflicted);
  this.slots.update();
  return damageInflicted;
}

prototype.heal = function(amount)
{
  var maxHP = this.getTotalAttribute("maxHP");
  var damageHealed = (maxHP - this.currentHP).cap(amount);
  this.set("currentHP", damageHealed);

	if (this.currentHP + damageHealed === maxHP && this.formList.length > 0 && this.formIndex > 0)
	{
    damageHealed += this.healedShape(amount - damageHealed);
	}

  return damageHealed;
}

prototype.healedShape = function(healingCarried)
{
  var maxHP;
  var damageHealed;

  this.set("formIndex", this.formIndex - 1);
  this.set("form", this.formList[this.formIndex]);

  maxHP = this.getTotalAttribute("maxHP");
  damageHealed = healingCarried.cap(maxHP - this.currentHP);
  this.heal(damageHealed);
  this.slots.update();
  return damageHealed;
}

prototype.reduceFatigue = function(amount)
{
  var originalFat;
  var fatigueReduced = amount.cap(this.fatigue);

	if (this.fatigue >= 100 && this.fatigue - fatigueReduced < 100)
	{
    this.setStatusEffect("unconscious", "DELETE");
	}

  this.set("fatigue", this.fatigue - fatigueReduced);
  return fatigueReduced;
}

prototype.reinvigorate = function(amount)
{
  amount += this.getTotalAbility("reinvigoration") || 0;

	if (this.fatigue >= 100)
	{
		amount += 5; //Reinvigorate 5 if it's unconscious
	}

	return this.reduceFatigue(amount);
}

prototype.getTotalProtection = function(hitLocation)
{
  return getTotalArmor(hitLocation) + getTotalNaturalArmor(hitLocation) + (getTotalAbility("invulnerability") || 0);
}

prototype.getElementalResistance = function(type)
{
  return getTotalAbility(type + "Resistance") || 0;
}

prototype.getTotalNaturalArmor = function(part)
{
  return (this.form.protection[part] || 0) + (this.getTotalAbility("naturalArmor") || 0);
}

prototype.getDualPenalty = function()
{
  return (this.slots.getDualPenalty() - (this.getTotalAbility("ambidextrous") || 0)).lowerCap(0);
};

prototype.getTotalAttribute = function(key)
{
  return (this.form[key] || 0) + (this[key] || 0) + (this.getEquippedAbility(key + "Bonus") || 0);
};

prototype.getTotalAbility = function(key)
{
  var characterAbility = this.getAbility(key);
  var formAbility = this.form.getAbility(key);
  var equippedAbility = this.getEquippedAbility(key);

  if (characterAbility == null && formAbility == null && equippedAbility == null)
  {
    return null;
  }

  else return (characterAbility || 0) + (formAbility || 0) + (equippedAbility || 0);
};

prototype.weaponTimesAvailable = function(id)
{
  return this.timesEquipped(id) + this.form.weaponTimesAvailable(id);
};

prototype.hasWeapon = function(id)
{
  if (this.hasEquipped(id) === true)
  {
    return true;
  }

  else if (this.form.hasNaturalWeapon(id) === true)
  {
    return true;
  }

  else return false;
}

prototype.getWeapon = function(id)
{
  return this.getItem(id) || this.form.getNaturalWeapon(id);
}
