

module.exports.SpecialAbility = function(data)
{
  var _id = data.id;
  var _name = data.name;
  var _type = data.type;                  //passive / active / sustained
  var _trigger = data.trigger;            //constant / on hit received / on damage received / on hit dealt / on damage dealt / NA (for passives)
  var _effectTypes = data.effectTypes;    //attack / damage altering / added damage effect / enhancement / override / penalty
  var _target = data.target;              //self / selected target / attack target / melee target / ranged target
  var _range = data.range;                //self / X distance
  var _areaOfEffect = data.areaOfEffect;  //circle (and radius) / cone (uses range)
  var _areaOfEffectDuration = data.areaOfEffectDuration;
  var _effectDuration = data.effectDuration;
  var _properties = data.properties;
  var _abilities = data.abilities;


  /**************************************
  *   VALUES FOR ATTACK TYPES    *
  **************************************/
  var _damage = data.damage || null;
  var _damageTypes = data.damageTypes || null;
  var _damageEffect = data.damageEffect || null;
  var _reach = data.reach || null;

  /****************************************
  *   VALUES FOR DAMAGE ALTERING TYPES    *
  ****************************************/

  /********************************************
  *   VALUES FOR ADDED DAMAGE EFFECT TYPES    *
  ********************************************/
  var _addedEffects =  data.addedEffects || null;

  /************************************
  *   VALUES FOR ENHANCEMENT TYPES    *
  ************************************/
  var _enhancements =  data.enhancements || null;

  /*********************************
  *   VALUES FOR OVERRIDE TYPES    *
  *********************************/
  var _overrides =  data.overrides || null;

  /*********************************
  *   VALUES FOR PENALTY TYPES    *
  *********************************/
  var _penalties =  data.penalties || null;


  /**************
  *   GETTERS   *
  **************/

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
      return _id;
    },
    enumerable: true
  });

  Object.defineProperty(this, "type",
  {
    get: function()
    {
      return _type.slice();
    },
    enumerable: true
  });

  Object.defineProperty(this, "trigger",
  {
    get: function()
    {
      return _trigger;
    },
    enumerable: true
  });

  Object.defineProperty(this, "effectTypes",
  {
    get: function()
    {
      return _effectTypes;
    },
    enumerable: true
  });

  Object.defineProperty(this, "target",
  {
    get: function()
    {
      return _target;
    },
    enumerable: true
  });

  Object.defineProperty(this, "range",
  {
    get: function()
    {
      return _range;
    },
    enumerable: true
  });

  Object.defineProperty(this, "areaOfEffect",
  {
    get: function()
    {
      return _areaOfEffect;
    },
    enumerable: true
  });

  Object.defineProperty(this, "areaOfEffectDuration",
  {
    get: function()
    {
      return _areaOfEffectDuration;
    },
    enumerable: true
  });

  Object.defineProperty(this, "effectDuration",
  {
    get: function()
    {
      return _effectDuration;
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

  if (_effectTypes.includes("attack") === true)
  {
    Object.defineProperty(this, "damage",
    {
      get: function()
      {
        return _damage;
      },
      enumerable: true
    });

    Object.defineProperty(this, "damageTypes",
    {
      get: function()
      {
        return _damageTypes.slice();
      },
      enumerable: true
    });

    Object.defineProperty(this, "damageEffect",
    {
      get: function()
      {
        return _damageEffect;
      },
      enumerable: true
    });

    Object.defineProperty(this, "reach",
    {
      get: function()
      {
        return _reach;
      },
      enumerable: true
    });
  }

  if (_effectTypes.includes("damageAltering") === true)
  {

  }

  if (_effectTypes.includes("damageEffects") === true)
  {
    Object.defineProperty(this, "addedEffects",
    {
      get: function()
      {
        return _addedEffects;
      },
      enumerable: true
    });
  }

  if (_effectTypes.includes("enhancement") === true)
  {
    Object.defineProperty(this, "enhancements",
    {
      get: function()
      {
        return Object.assign({}, _enhancements);
      },
      enumerable: true
    });
  }

  if (_effectTypes.includes("override") === true)
  {
    Object.defineProperty(this, "overrides",
    {
      get: function()
      {
        return Object.assign({}, _overrides);
      },
      enumerable: true
    });
  }

  if (_effectTypes.includes("penalty") === true)
  {
    Object.defineProperty(this, "penalties",
    {
      get: function()
      {
        return Object.assign({}, _penalties);
      },
      enumerable: true
    });
  }

  /****************************
  *   PRIVILEGED FUNCTIONS    *
  ****************************/

  this.toJSON = function()
  {
    var obj =
    {
      id: _id,
      name: _name,
      type: _type,
      trigger: _trigger,
      effectTypes: _effectTypes,
      target: _target,
      range: _range,
      areaOfEffect: _areaOfEffect,
      areaOfEffectDuration: _areaOfEffectDuration,
      effectDuration: _effectDuration,
      properties: _properties,
      abilities: _abilities,
      damage: _damage,
      damageTypes: _damageTypes,
      damageEffect: _damageEffect,
      reach: _reach,
      addedEffects: _addedEffects,
      enhancements: _enhancements,
      overrides: _overrides,
      penalties: _penalties
    };

    return obj;
  }

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
    if (_abilities[key] != null)
    {
      return _abilities[key];
    }

    else return null;
  };

  //the ... keyword is called the 'rest parameters', which is
  //an array (map?) of the remaining parameters passed to a
  //function, allowing for an unlimited number of them
  this.add = function(...others)
  {
    var clone = Object.assign({}, this);

    for (var value of others)
    {
      if (value == null || clone.name !== value.name)
      {
        continue;
      }

      if (_effectTypes.includes("attack") === true)
      {
        var powerSum = _damage + _reach;
        var otherPowerSum = value.damage + value.reach;

        if (powerSum >= otherPowerSum)
        {
          return clone;
        }

        else return Object.assign({}, otherAbility);
      }
    }

    return clone;
  };

  this.subtract = function(...others)
  {
    for (var value of others)
    {
      if (value == null || this.name !== value.name)
      {
        return clone;
      }

      if (_effectTypes.includes("attack") === true)
      {
        var powerSum = _damage + _reach;
        var otherPowerSum = value.damage + value.reach;

        if (powerSum >= otherPowerSum)
        {
          return clone;
        }

        else return Object.assign({}, otherAbility);
      }
    }
  };

  this.chooseDamageType = function()
  {
    if (_damageTypes == null)
    {
      return null;
    }

    else return _damageTypes[Math.floor(Math.random() * _damageTypes.length)];
  };
}
