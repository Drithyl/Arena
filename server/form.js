
var prototype;

module.exports =
{
  Form: function(data)
  {
    //minimum required properties that cannot be defaulted
    var _id = data.id;
    var _name = data.name;
    var _maxHP = data.maxHP;
    var _parts = data.parts;

    //Required properties, but these can be defaulted (they SHOULDN'T)
    var _formList = data.formList || [data.id];
    var _cost = data.cost || null;
    var _size = data.size || 2;
    var _sizeType = data.sizeType || "humanoid";
    var _magicResistance = data.magicResistance || 0;
    var _morale = data.morale || 0;
    var _strength = data.strength || 0;
    var _attack = data.attack || 0;
    var _defence = data.defence || 0;
    var _precision = data.precision || 0;
    var _actionPoints = data.actionPoints || 0;
    var _movementPoints = data.movementPoints || 0;
    var _paths = data.paths || null;
    var _properties = data.properties || [];
    var _abilities = data.abilities || {};
    var _specialAbilities = data.specialAbilities || {};
    var _slots = data.slots || {miscellaneous: 2};
    var _naturalWeapons = data.naturalWeapons || null;
    var _categories = data.categories || [];


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

    Object.defineProperty(this, "maxHP",
    {
      get: function()
      {
        return _maxHP;
      },
      enumerable: true
    });

    Object.defineProperty(this, "formList",
    {
      get: function()
      {
        return _formList.slice();
      },
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

    Object.defineProperty(this, "sizeType",
    {
      get: function()
      {
        return _sizeType;
      },
      enumerable: true
    });

    Object.defineProperty(this, "magicResistance",
    {
      get: function()
      {
        return _magicResistance;
      },
      enumerable: true
    });

    Object.defineProperty(this, "morale",
    {
      get: function()
      {
        return _morale;
      },
      enumerable: true
    });

    Object.defineProperty(this, "strength",
    {
      get: function()
      {
        return _strength;
      },
      enumerable: true
    });

    Object.defineProperty(this, "attack",
    {
      get: function()
      {
        return _attack;
      },
      enumerable: true
    });

    Object.defineProperty(this, "defence",
    {
      get: function()
      {
        return _defence;
      },
      enumerable: true
    });

    Object.defineProperty(this, "precision",
    {
      get: function()
      {
        return _precision;
      },
      enumerable: true
    });

    Object.defineProperty(this, "actionPoints",
    {
      get: function()
      {
        return _actionPoints;
      },
      enumerable: true
    });

    Object.defineProperty(this, "movementPoints",
    {
      get: function()
      {
        return _movementPoints;
      },
      enumerable: true
    });

    Object.defineProperty(this, "slots",
    {
      get: function()
      {
        return Object.assign({}, _slots);
      },
      enumerable: true
    });

    Object.defineProperty(this, "properties",
    {
      get: function()
      {
        return _properties.slice();
      },
      enumerable: true
    });

    Object.defineProperty(this, "abilities",
    {
      get: function()
      {
        return Object.assign({}, _abilities);
      },
      enumerable: true
    });

    Object.defineProperty(this, "specialAbilities",
    {
      get: function()
      {
        return Object.assign({}, _specialAbilities);
      },
      enumerable: true
    });

    Object.defineProperty(this, "categories",
    {
      get: function()
      {
        return _categories.slice();
      },
      enumerable: true
    });


    /**************************
    *   PRIVILEDGED METHODS   *
    **************************/

    this.toJSON = function()
    {
      var obj =
      {
        name: _name,
        id: _id,
        maxHP: _maxHP,
        cost: _cost,
        formList: _formList,
        size: _size,
        sizeType: _sizeType,
        magicResistance: _magicResistance,
        morale: _morale,
        strength: _strength,
        attack: _attack,
        defence: _defence,
        precision: _precision,
        actionPoints: _actionPoints,
        movementPoints: _movementPoints,
        paths: _paths,
        properties: _properties,
        abilities: _abilities,
        specialAbilities: _specialAbilities,
        slots: _slots,
        parts: _parts,
        naturalWeapons: _naturalWeapons,
        categories: _categories
      };

      return obj;
    };

    this.getAttribute = function(key)
    {
      if (_abilities["shapeshift"] != null)
      {
        return this[key] * Math.round(_abilities["shapeshift"] / 100);
      }

      else return this[key];
    };

    this.hasProperty = function(key)
    {
      if (_properties.includes(key) === true)
      {
        return true;
      }

      else return false;
    };

    this.getAbility = function(key)
    {
      var total = 0;

      for (var ability in _abilities)
      {
        if (key == ability && isNaN(this._abilities[ability]) === false)
        {
          total += _abilities[ability];
        }
      }

      if (total === 0)
      {
        return null;
      }

      else return total;
    };

    this.getTriggerAbilities = function(trigger)
    {
      var triggerAbilities = [];

      for (var key in _abilities)
      {
        if (_abilities[key].trigger != null || _abilities[key].trigger === trigger)
        {
          triggerAbilities.push(_abilities[key]);
        }
      }

      return triggerAbilities;
    };

    this.weaponTimesAvailable = function(weaponID)
    {
      if (_naturalWeapons == null || _naturalWeapons.length < 1)
      {
        return 0;
      }

      return _naturalWeapons.filter(function(weapon)
      {
        return weapon.id === id
      }).length;
    }

    this.getNaturalWeapon = function(id)
    {
      var arr = [];

      if (_naturalWeapons == null || _naturalWeapons.length < 1)
      {
        return arr;
      }

      return _naturalWeapons.filter(function(attack) {  return attack.id === id; });
    };

    this.hasNaturalWeapon = function(id)
    {
      if (_naturalWeapons == null || _naturalWeapons.length < 1)
      {
        return null;
      }

      for (var i = 0; i < _naturalWeapons.length; i++)
      {
        if (_naturalWeapons[i].id === id)
        {
          return _naturalWeapons[i];
        }
      }

      return null;
    };
  }
}

prototype = module.exports.Form.prototype;


/**********************
*   PUBLIC METHODS    *
**********************/
