
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

      if (value === "DELETE")
      {
        delete _statusEffects[status];
      }

      else _statusEffects[status] = value;
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

    this.applyDamage = function(damage, damageEffect, damageType)
    {
      var result = {};

      if (damageEffect === "stun")
      {
        result = applyFatigue(finalDamage);
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

    this.applyFatigue = function(amount)
    {
      var totalFatigue = this.fatigue + fatigue;
      var fatigueAdded = (totalFatigue - currentFatigue).cap(200);
      var fatigueDamage = Math.floor((totalFatigue - 200) * 0.2);
      var damageInflicted;

      if (fatigueAdded > 0)
      {
        this.fatigue += fatigueAdded;
      }

      if (fatigueDamage > 0)
      {
        damageInflicted = reduceHP(actor, fatigueDamage);
      }

      if (actor.fatigue >= 100)
      {
        this.setStatusEffect("berserk", "DELETE");
      }

      return {fatigueAdded: fatigueAdded, damageInflicted: damageInflicted};
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
    };

    this.getSlot = function(slotType, index)
    {
      if (_slotList[slotType] == null || _slotList[slotType][index] == null)
      {
        return null;
      }

      return _slotList[slotType][index];
    };

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

    this.getEquippedAbility = function(key)
    {
      var total;
      var items = this.getAllEquippedItems();

      items.forEach(function(item)
      {
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
      });

      //can be undefined, in which case the item does not have the ability.
      //This is because some abilities might have a zero value.
      return total;
    };

    this.getEquippedSpecialAbility = function(abilityKey)
    {
      var ability;
      var items = this.getAllEquippedItems();

      items.forEach(function(item)
      {
        if (item == null)
        {
          continue;
        }

        var equippedAbility = item.getSpecialAbility(abilityKey);

        if (equippedAbility == null)
        {
          continue;
        }

        if (ability == null)
        {
          ability = equippedAbility;
        }

        else if (typeof ability.add === "function")
        {
          ability = ability.add(equippedAbility);
        }
      }

      return ability;
    };

    this.getAllEquippedSpecialAbilities = function()
    {
      var items = this.getAllEquippedItems();
      var abilities = {};

      items.forEach(function(item)
      {
        var itemAbilities = item.specialAbilities;

        for (var key in itemAbilities)
        {
          abilities[key] = itemAbilities[key].add(abilities[key]);
        }
      });

      return abilities;
    };

    this.getTotalSpecialAbility(key)
    {
      var ability = this.getSpecialAbility(key);
      var equippedAbility = this.getEquippedSpecialAbility(key);

      if (ability == null && equippedAbility == null)
      {
        return null;
      }

      else if (ability != null && equippedAbility != null)
      {
        return ability.add(equippedAbility);
      }

      else if (ability == null)
      {
        return ability;
      }

      else return equippedAbility;
    };

    this.getAllSpecialAbilities = function()
    {
      var keysChecked = [];
      var finalAbilities = {};
      var specialAbilities = this.specialAbilities;
      var formSpecialAbilities = this.form.specialAbilities;
      var equippedSpecialAbilities = this.getAllEquippedSpecialAbilities();

      //Check the abilities in the character and add the same ones from the form
      //and equipment
      for (var key in specialAbilities)
      {
        keysChecked.push(key);
        finalAbilities[key] = specialAbilities[key].add(formSpecialAbilities[key], equippedSpecialAbilities[key]);
      }

      //Check the abilities in the form, but only add the equipment ones since all
      //of the character ones were already looped through
      for (var key in formSpecialAbilities)
      {
        if (keysChecked.includes(key) === false)
        {
          keysChecked.push(key);
          finalAbilities[key] = formSpecialAbilities[key].add(equippedSpecialAbilities[key]);
        }
      }

      //Add the remaining unchecked equipped abilities
      for (var key in equippedSpecialAbilities)
      {
        if (keysChecked.includes(key) === false)
        {
          keysChecked.push(key);
          finalAbilities[key] = equippedSpecialAbilities[key];
        }
      }
    }

    this.getWieldingPenalty = function()
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
    var _paths = data.paths || {};
    var _properties = data.properties || [];
    var _abilities = data.abilities || {};
    var _specialAbilities = data.specialAbilities || {};
    var _appliedSpecialAbilities = data.appliedSpecialAbilities || {};

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

    Object.defineProperty(this, "bodyparts",
    {
      get: function()
      {
        return this.form.parts;
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
      var totalApplied = amount.cap(this.getTotalAttribute("maxHP") - currentPoison;
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

      var (for key in _specialAbilities)
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
        if (item == null)
        {
          continue;
        }

        var abilities = item.abilities;

        if (abilities == null)
        {
          continue;
        }

        for (var key in abilities)
        {
          if (abilities[key].trigger != null || abilities[key].trigger === trigger)
          {
            triggerAbilities.push(abilities[key]);
          }
        }
      });

      return triggerAbilities;
    };

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
