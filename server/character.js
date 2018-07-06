
var content;
var prototype;

/*
*   Properties, Abilities and Special Abilities will now all be concentrated
*   in the character's lists, _properties, _abilities and _specialAbilities.
*   They will contain different keys, representing the sources of the effects.
*/

module.exports =
{
  Character: function(data)
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
        level: _level,
        maxHP: _maxHP,
        currentHP: _currentHP,
        actionPoints: _actionPoints,
        movementPoints: _movementPoints,
        attributes: _attributes,
        defaultWeapons: _defaultWeapons,
        afflictions: _afflictions,
        properties: _properties,
        abilities: _abilities,
        specialAbilities: _specialAbilities,
        activeSpecialAbilities: _activeSpecialAbilities,
        size: _size,
        bodyType: _bodyType,
        originalBodyparts: _originalBodyparts,
        currentBodyparts: _currentBodyparts,
        originalSlots: _originalSlots,
        currentSlots: _currentSlots,
        freeSlots: _freeSlots,
        equipment: _equipment
      };

      return obj;
    };

    this.toDatabase = function()
    {
      //uses the toJSON method because the data to be saved in the database is the
      //same one, and toJSON is required for when JSON.stringify() is called on
      //this object
      return this.toJSON();
    };

    this.getStatusEffect = function(status)
    {
      return _statusEffects[status];
    };

    this.setStatusEffect = function(status, value)
    {
      //TODO verify if status is in list of existing ones
      //TODO verify validity of value for existing status

      if (value === "DELETE")
      {
        delete _statusEffects[status];
      }

      else _statusEffects[status] = value;
      _changes.statusEffects[status] = value;
    };

    this.hasProperty = function(key)
    {
      if (_properties[key] != null)
      {
        return true;
      }

      else return false;
    };

    this.getAbility = function(key)
    {
      var total = 0;

      if (_abilities[key] == null)
      {
        return null;
      }

      for (var source in _abilities[key])
      {
        if (isNaN(_abilities[key][source]) === true)
        {
          continue;
        }

        total += _abilities[key][source];
      }

      return total;
    }

    //TODO
    this.getSpecialAbility = function(key)
    {
      if (_specialAbilities[key] == null)
      {
        return null;
      }

      else return _specialAbilities[key];
    }

    this.getChanges = function()
    {
      var changes = Object.assign({}, _changes);
      _changes = {};
      return changes;
    };

    this.applyDamage = function(damage, damageEffect, damageType)
    {
      var result = {};

      if (damageEffect === "stun")
      {
        result = reduceStamina(finalDamage);
      }

      else if (damageEffect === "poison")
      {
        result.damageInflicted = applyPoison(damage);
      }

      else if (damageEffect === "paralysis")
      {
        result.damageInflicted = applyParalysis(damage);
      }

      else
      {
        result.damageInflicted = reduceHP(damage);
      }

      if (damageType === "cold" || damageType === "fire")
      {
        result.ignited = ignites(result.damageInflicted, damageType);
      }

      if (this.currentHP <= 0)
      {
        this.setStatusEffect("ko", true);
        result.ko = true;
      }

      result.damageLeft = damage - result.damageInflicted;
      return result;
    };

    this.reduceStamina = function(amount)
    {
      var staminaReduced = amount.cap(this.stamina);
      var fatigueDamage = Math.floor(amount - staminaReduced * 0.2);
      var damageInflicted;

      if (staminaReduced > 0)
      {
        this.stamina += fatigueAdded;
      }

      if (fatigueDamage > 0)
      {
        damageInflicted = reduceHP(fatigueDamage);
      }

      if (this.stamina <= 0)
      {
        this.setStatusEffect("berserk", "DELETE");
      }

      return {staminaReduced: staminaReduced, damageInflicted: damageInflicted};
    }


    /**********************
    *   EFFECT TRIGGERS   *
    **********************/

    this.persistent = function()
    {
      //stuff like weapons' onHit abilities trigger here
      effectsModule.persistent(getTriggerAbilities("persistent"), this);
    };

    /**********************************
    *   EQUIPMENT-RELATED FUNCTIONS   *
    **********************************/

    //slots is the number of slots in which to equip the item, it's an array of
    //slot indexes, i.e. which specific slots were designated
    this.equip = function(nbrOfSlots, item)
    {
      var usedSlots;

      if (item.type === "weapon" && item.gripSpace < this.size * nbrOfSlots)
      {
        throw new Error("This weapon doesn't have enough grip space for this many hands of this size!");
      }

      else if (_freeSlots[item.slotType] < item.requiredSlots)
      {
        throw new Error("There aren't enough slots to equip this item.");
      }

      else if  (_freeSlots[item.slotType] < nbrOfSlots)
      {
        throw new Error("There aren't enough slots to equip this item.");
      }

      _freeSlots[item.slotType] -= nbrOfSlots;
      _equipment[item.slotType].push({item: item, nbrOfSlots: nbrOfSlots});
    };

    this.unequip = function(slotType, slotIndex)
    {
      if (_equipment[slotType] == null)
      {
        throw new Error("The character does not have this type of slot available.");
      }

      else if (_equipment[slotType].length < slotIndex || _equipment[slotType][slotIndex] == null)
      {
        throw new Error("The slot selected has nothing equipped in it.");
      }

      else if (_equipment[slotType][slotIndex].item == null)
      {
        throw new Error("The item equipped in this slot is null.");
      }

      _freeSlots[item.slotType] += _equipment[slotType][slotIndex].nbrOfSlots;
      _equipment[item.slotType].splice(slotIndex, 1);
    };

    this.getAllEquippedItems = function()
    {
      var items = [];

      for (var key in _equipment)
      {
        _equipment[key].forEach(function(slot)
        {
          if (slot.item != null)
          {
            items.push(slot.item);
          }
        });
      }

      return items;
    };

    this.getAllEquippedWeapons = function()
    {
      var weapons = [];

      for (var key in _equipment)
      {
        _equipment[key].forEach(function(slot)
        {
          if (slot.item != null && slot.item.type === "weapon")
          {
            weapons.push(slot.item);
          }
        });
      }

      return weapons;
    };

    //TODO will have to send data of slots removed to client
    this.removeSlots = function(slotType, amount)
    {
      var itemsToRemove;
      var indexesAvailableToRemove;

      if (_currentSlots[slotType] == null || _currentSlots[slotType] <= 0)
      {
        return;
      }

      itemsToRemove = amount - _freeSlots[slotType];

      //reduce the number of free slots based on how many items need removing
      _freeSlots[slotType] = amount - itemsToRemove;

      //loop to remove items
      while(itemsToRemove > 0)
      {
        indexesAvailableToRemove = 0;

        //Find out all the indexes available
        _equipment[slotType].forEach(function(index)
        {
          indexesAvailableToRemove += slot.nbrOfSlots;
        });

        //choose index at random and unequip the item
        this.unequip(slotType, Math.floor(Math.random() * indexesAvailableToRemove));
        itemsToRemove--;
      }

      //reduce the currentSlots
      _currentSlots[slotType] = (_currentSlots[slotType] - amount).lowerCap(0);
    };

    this.regainSlots = function(slotType, amount)
    {
      var finalAmountGained;

      if (_originalSlots[slotType] == null || _originalSlots[slotType] <= amount)
      {
        return;
      }

      finalAmountGained = amount.cap(_originalSlots[slotType] - _currrentSlots[slotType]);
      _currentSlots[slotType] += finalAmountGained;
      _freeSlots[slotType] += finalAmountGained;
    };

    this.hasSlot = function(slotType, slotIndex)
    {
      //if the length of all current slots is higher than the index,
      //then the slot certainly exists
      if (_currentSlots[slotType] > slotIndex)
      {
        return true;
      }

      else return false;
    }

    this.getEquippedItem = function(slotType, slotIndex)
    {
      if (_equipment[slotType] == null || _equipment[slotType][slotIndex] == null || _equipment[slotType][slotIndex].item == null)
      {
        return null;
      }

      return _equipment[slotType][slotIndex].item;
    };

    this.getEquippedSlot = function(slotType, slotIndex)
    {
      if (_equipment[slotType] == null || _equipment[slotType][slotIndex] == null)
      {
        return null;
      }

      return _equipment[slotType][slotIndex];
    };

    this.getWieldingPenalty = function()
    {
      var total = 0;
      var weaponsEquipped = this.getAllEquippedWeapons();

      weaponsEquipped.forEach(function(weapon)
      {
        if (weapon.hasProperty("extra") === false)
        {
          //"Extra" weapons are bonus weapons that do not
          //add penalty, like natural weapons
          total += weapon.reach;
        }
      });

      return total.lowerCap(0);
    };

    this.getTotalArmor = function(part)
    {
      var total = 0;

      _equipment[part].forEach(function(slot)
      {
        if (slot.item != null && slot.item.type === "armor")
        {
          total += slot.item.getPartProtection(part);
        }
      });

      return total;
    };


    //All private members are declared with "var". All public members
    //are declared with this.
    //Required values, whether it's a new character or a revived one
    var _name = data.name;
    var _id = data.id;
    var _player = data.username;
    var _maxHP = data.maxHP;
    var _currentHP = data.currentHP || _maxHP;
    var _actionPoints = data.actionPoints;
    var _movementPoints = data.movementPoints;
    var _attributes = data.attributes;
    var _size = data.size;
    var _bodyType = data.bodyType;
    var _originalBodyparts = data.originalBodyparts || data.bodyparts;
    var _currentBodyparts = data._currentBodyparts || data.bodyparts;
    var _originalSlots = data.originalSlots || data.slotCount;          //total slots that the form originally had
    var _currentSlots = data.currentSlots || data.slotCount;            //current slots that the form has (due to losing some, for instance)
    var _freeSlots = data.freeSlots || data.slotCount;                  //current *free* slots that the form has, i.e. unequipped ones
    var _equipment = data.equipment;                                    //object with slot keys that contain an array of objects, each containing an equipped item in that slot {item: Object, nbrOfSlots: Int, usedIndexes: Array of Ints}

    //Optional values; new characters will only have the default values here,
    //whereas revived characters will load their own
    var _level = data.level || 0;
    var _defaultWeapons = data.defaultWeapons || {};
    var _afflictions = data.afflictions || null;
    var _properties = data.properties || {};
    var _abilities = data.abilities || {};
    var _specialAbilities = data.specialAbilities || {};
    var _activeSpecialAbilities = data.activeSpecialAbilities || {};

    //Temporary values (battle-related values) that will always be at a default
    //state when the character is loaded up
    var _stamina = 0;
    var _statusEffects = {harassment: 0};
    var _actionPointsLeft = this.actionPoints;
    var _movementPointsLeft = this.movementPoints;
    var _changes = {statusEffects: {}};

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

    Object.defineProperty(this, "size",
    {
      get: function()
      {
        return _size;
      },
      enumerable: true
    });

    Object.defineProperty(this, "bodyType",
    {
      get: function()
      {
        return _bodyType;
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

    Object.defineProperty(this, "attributes",
    {
      get: function()
      {
        return Object.assign({}, _attributes);
      },
      enumerable: true
    });

    Object.defineProperty(this, "originalBodyparts",
    {
      get: function()
      {
        return Object.assign({}, _originalBodyparts);
      },
      enumerable: true
    });

    Object.defineProperty(this, "currentBodyparts",
    {
      get: function()
      {
        return Object.assign({}, _currentBodyparts);
      },
      enumerable: true
    });

    Object.defineProperty(this, "originalSlots",
    {
      get: function()
      {
        return Object.assign({}, _originalSlots);
      },
      enumerable: true
    });

    Object.defineProperty(this, "currentSlots",
    {
      get: function()
      {
        return Object.assign({}, _currentSlots);
      },
      enumerable: true
    });

    Object.defineProperty(this, "freeSlots",
    {
      get: function()
      {
        return Object.assign({}, _freeSlots);
      },
      enumerable: true
    });

    Object.defineProperty(this, "defaultWeapons",
    {
      get: function()
      {
        return Object.assign({}, _defaultWeapons);
      },
      enumerable: true
    });

    Object.defineProperty(this, "magicResistance",
    {
      get: function()
      {
        return _attributes.magicResistance;
      },
      enumerable: true
    });

    Object.defineProperty(this, "willpower",
    {
      get: function()
      {
        return _attributes.willpower;
      },
      enumerable: true
    });

    Object.defineProperty(this, "strength",
    {
      get: function()
      {
        return _attributes.strength;
      },
      enumerable: true
    });

    Object.defineProperty(this, "agility",
    {
      get: function()
      {
        return _attributes.agility;
      },
      enumerable: true
    });

    Object.defineProperty(this, "dexterity",
    {
      get: function()
      {
        return _attributes.dexterity;
      },
      enumerable: true
    });

    Object.defineProperty(this, "power",
    {
      get: function()
      {
        return _attributes.power;
      },
      enumerable: true
    });

    Object.defineProperty(this, "endurance",
    {
      get: function()
      {
        return _attributes.endurance;
      },
      enumerable: true
    });

    Object.defineProperty(this, "resilience",
    {
      get: function()
      {
        return _attributes.resilience;
      },
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

    Object.defineProperty(this, "stamina",
    {
      get: function()
      {
        return _stamina;
      },
      set: function(value)
      {
        if (isNaN(value) === false && value >= 0)
        {
          _stamina = Math.floor(value);
          _changes["stamina"] = _stamina;
        }
      },
      configurable: true,
      enumerable: true
    });

    /**********************
    *   PRIVATE METHODS   *
    **********************/

    function addSpecialAbility(ability)
    {
      if (_appliedSpecialAbilities[ability.name] == null)
      {
        _appliedSpecialAbilities[ability.name] = ability.name;
      }

      else _appliedSpecialAbilities[ability.name].add(ability);
    }

    function removeSpecialAbility(ability)
    {
      _appliedSpecialAbilities[ability.name].subtract(ability);

      if (_appliedSpecialAbilities[ability.name] == null)
      {
        delete _appliedSpecialAbilities[ability.name];
      }
    }

    function healHP(amount)
    {
      var maxHP = this.getTotalAttribute("maxHP");
      var damageHealed = amount.cap(maxHP - this.currentHP);
      var healRemaining = amount - damageHealed;

      while (healRemaining > 0 && this.isInFirstForm === false)
      {
        this.previousForm();
        maxHP = this.getTotalAttribute("maxHP");
        damageHealed += healRemaining.cap(maxHP);

        if (healRemaining <= maxHP)
        {
          //no more damage left, so set the final form's current hp
          this.currentHP = healRemaining;
        }

        healRemaining = healRemaining - healRemaining.cap(maxHP);
      }

      return damageHealed;
    }

    function reduceHP(damage)
    {
      var damageInflicted = damage.cap(this.currentHP);
      var damageRemaining = damage - damageInflicted;
      var nextFormHP;

      while (damageRemaining > 0 && this.isInLastForm === false)
      {
        this.nextForm();
        nextFormHP = this.getTotalAttribute("maxHP");
        damageInflicted += damageRemaining.cap(nextFormHP);

        if (damageRemaining - nextFormHP <= 0)
        {
          //no more damage left, so set the final form's current hp
          this.currentHP = nextFormHP - damageRemaining;
        }

        damageRemaining -= nextFormHP;
      }

      return damageInflicted;
    }

    function applyPoison(amount)
    {
      var currentPoison = this.getStatusEffect("poison") || 0;
      var totalApplied = amount.cap(this.getTotalAttribute("maxHP") - currentPoison);
      this.setStatusEffect("poison", currentPoison + totalApplied);
      return totalApplied;
    };

    function applyParalysis(amount)
    {
      var total = Math.floor((amount - this.size) * 0.5);
      var currentParalysis = this.getStatusEffect("paralysis") || 0;

      if (currentParalysis > total)
      {
        total = Math.floor(currentParalysis * 0.5).cap(5);
      }

      else if (currentParalysis > 0)
      {
        total = Math.floor(total * 0.5).cap(5);
      }

      this.setStatusEffect("paralysis", total);
      return total;
    };

    function ignites(damage, damageType)
    {
      if (damageType !== "cold" && damageType !== "fire")
      {
        return false;
      }

      var igniteChance = damage * 5;
    	var roll = Math.floor((Math.random() * 100)) + 1;

    	if (roll > igniteChance)
    	{
    		return false;
    	}

      this.setStatusEffect(damageType, true);
      return true;
    };

    function getTriggerAbilities(trigger)
    {
      var triggerAbilities = [];
      var formSpecialAbilities = this.form.specialAbilities;
      var equippedSpecialAbilities = getAllEquippedSpecialAbilities();

      for (var key in _specialAbilities)
      {
        if (_specialAbilities[key].trigger != null && _specialAbilities[key].trigger === trigger)
        {
          triggerAbilities.push(_specialAbilities[key].add(formSpecialAbilities[key], equippedSpecialAbilities[key]));
        }
      }

      return triggerAbilities.concat(this.form.getTriggerAbilities(trigger), getEquippedTriggerAbilities(trigger));
    }

    //The slotsChecked array is used to prevent
    //counting items that take up more than a single
    //slot, like two-handed weapons, multiple times,
    //instead of the one. It is reset for each new slot
    //type, since an item can't occupy several slots of
    //different kinds
    function getEquippedTriggerAbilities(trigger)
    {
      var triggerAbilities;
      var items = this.getAllEquippedItems();

      items.forEach(function(item)
      {
        if (item != null && item.abilities != null)
        {
          for (var key in item.abilities)
          {
            if (item.abilities[key].trigger != null || item.abilities[key].trigger === trigger)
            {
              triggerAbilities.push(item.abilities[key]);
            }
          }
        }
      });

      return triggerAbilities;
    };

    function createEmptySlots(type, amount)
    {
      if (_slotList[type] == null || isNaN(amount) === true)
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

prototype.reduceFatigue = function(amount)
{
  var originalFat;
  var fatigueReduced = amount.cap(this.fatigue);

	if (this.fatigue >= 100 && this.fatigue - fatigueReduced < 100)
	{
    this.setStatusEffect("unconscious", "DELETE");
	}

  this.fatigue -= fatigueReduced;
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

prototype.getDamageImmunity = function(type)
{
  return getTotalAbility(type + "Immunity") || 0;
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
  return (this.attributes[key] || 0);
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
