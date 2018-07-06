

module.exports =
{
  CreateItem: function(data)
  {
    if (data.type === "armor")
    {
      return new Armor(data);
    }

    else if (data.type === "shield")
    {
      return new Shield(data);
    }

    else if (data.type === "trinket")
    {
      return new Trinket(data);
    }

    else if (data.type === "weapon")
    {
      return new Weapon(data);
    }

    else if (data.type === "special attack")
    {
      return new SpecialAttack(data);
    }

    else return new Item(data);
  }
}

function Item(data)
{
  var _id = data.id;
  var _name = data.name;
  var _cost = data.cost || null;
  var _requiredSlots = data.requiredSlots || 0;
  var _slotType = data.slotType || "miscellaneous";
  var _abilities = data.abilities || {};
  var _properties = data.properties || [];
  var _specialAbilities = data.specialAbilities || {};
  var _categories = data.categories || ["Miscellaneous"];
  var _rarity = data.rarity || 0;
  var _description = data.description || "This item has no description.";
  var _type = "untyped";

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

  Object.defineProperty(this, "cost",
  {
    get: function()
    {
      return _cost;
    },
    enumerable: true
  });

  Object.defineProperty(this, "requiredSlots",
  {
    get: function()
    {
      return _requiredSlots;
    },
    enumerable: true
  });

  Object.defineProperty(this, "slotType",
  {
    get: function()
    {
      return _slotType;
    },
    enumerable: true
  });

  Object.defineProperty(this, "rarity",
  {
    get: function()
    {
      return _rarity;
    },
    enumerable: true
  });

  Object.defineProperty(this, "description",
  {
    get: function()
    {
      return _description;
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

  Object.defineProperty(this, "properties",
  {
    get: function()
    {
      return _properties.slice();
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
      id: _id,
      name: _name,
      cost: _cost,
      requiredSlots: _requiredSlots,
      slotType: _slotType,
      abilities: _abilities,
      properties: _properties,
      specialAbilities: _specialAbilities,
      categories: _categories,
      rarity: _rarity,
      description: _description,
      type: _type
    };

    return obj;
  }

  this.hasProperty = function(property)
  {
    if (_properties.includes(property) === true)
    {
      return true;
    }

    else return false;
  };

  this.isOfCategory = function(category)
  {
    if (_categories.includes(category) === true)
    {
      return true;
    }

    else return false;
  };

  this.getAbility = function(key)
  {
    var total;

    if (_abilities != null)
    {
      for (var ab in _abilities)
      {
        if (key == ab && isNaN(_abilities[ab]) === false)
        {
          if (total === null)
          {
            total = _abilities[ab];
          }

          total += _abilities[ab];
        }
      }
    }

    //can be undefined, in which case the item does not have the ability.
    //This is because some abilities might have a zero value.
    return total;
  };

  this.getSpecialAbility = function(key)
  {
    if (_specialAbilities[key] == null)
    {
      return null;
    }

    else return _specialAbilities[key];
  };
}

function Armor(data)
{
  Item.apply(this, arguments);

  //armor-specific
  var _type = "armor";
  var _protection = data.protection || null;
  var _encumbrance = data.encumbrance || 0;

  /**************************
  *   GETTERS AND SETTERS   *
  **************************/

  Object.defineProperty(this, "type",
  {
    get: function()
    {
      return _type;
    },
    enumerable: true
  });

  Object.defineProperty(this, "encumbrance",
  {
    get: function()
    {
      return _encumbrance;
    },
    enumerable: true
  });

  Object.defineProperty(this, "protection",
  {
    get: function()
    {
      return Object.assign({}, _protection);
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
      id: this.id,
      name: this.name,
      cost: this.cost,
      requiredSlots: this.requiredSlots,
      slotType: this.slotType,
      abilities: this.abilities,
      properties: this.properties,
      categories: this.categories,
      rarity: this.rarity,
      description: this.description,
      type: _type,
      protection: this.protection,
      encumbrance: _encumbrance
    };

    return obj;
  };

  this.getPartProtection = function(part)
  {
    if (_protection[part] == null || isNaN(_protection[part]) === true)
    {
      return 0;
    }

    else return _protection[part];
  };
}

function Shield(data)
{
  Item.apply(this, arguments);

  //shield-specific
  var _type = "shield";
  var _shieldProtection = data.shieldProtection || 0;
  var _parry = data.parry || 0;
  var _encumbrance = data.encumbrance || 0;

  /**************************
  *   GETTERS AND SETTERS   *
  **************************/

  Object.defineProperty(this, "type",
  {
    get: function()
    {
      return _type;
    },
    enumerable: true
  });

  Object.defineProperty(this, "shieldProtection",
  {
    get: function()
    {
      return _shieldProtection;
    },
    enumerable: true
  });

  Object.defineProperty(this, "parry",
  {
    get: function()
    {
      return _parry;
    },
    enumerable: true
  });

  Object.defineProperty(this, "encumbrance",
  {
    get: function()
    {
      return _encumbrance;
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
      id: this.id,
      name: this.name,
      cost: this.cost,
      requiredSlots: this.requiredSlots,
      slotType: this.slotType,
      abilities: this.abilities,
      properties: this.properties,
      categories: this.categories,
      rarity: this.rarity,
      description: this.description,
      type: _type,
      parry: _parry,
      shieldProtection: _shieldProtection,
      encumbrance: _encumbrance
    };

    return obj;
  };
}

function Trinket(data)
{
  Item.apply(this, arguments);

  //trinket-specific
  var _type = "trinket";

  /**************************
  *   GETTERS AND SETTERS   *
  **************************/

  Object.defineProperty(this, "type",
  {
    get: function()
    {
      return _type;
    },
    enumerable: true
  });

  this.toJSON = function()
  {
    var obj =
    {
      id: this.id,
      name: this.name,
      cost: this.cost,
      requiredSlots: this.requiredSlots,
      slotType: this.slotType,
      abilities: this.abilities,
      properties: this.properties,
      categories: this.categories,
      rarity: this.rarity,
      description: this.description,
      type: _type,
    };

    return obj;
  };
}

function Weapon(data)
{
  Item.apply(this, arguments);

  //weapon-specific
  var _type = "weapon";
  var _attack = data.attack || 0;
  var _defence = data.defence || 0;
  var _damage = data.damage || 0;
  var _damageTypes = data.damageTypes || ["untyped"];
  var _damageEffect = data.damageEffect || "damage";
  var _reach = data.reach || 0;
  var _onHit = data.onHit || null;
  var _onDamage = data.onDamage || null;
  var _canRepel = data.canRepel || false;
  var _canCleave = data.canCleave || false;
  var _gripSpace = data.gripSpace || 0;

  /**************************
  *   GETTERS AND SETTERS   *
  **************************/

  Object.defineProperty(this, "type",
  {
    get: function()
    {
      return _type;
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

  Object.defineProperty(this, "weaponType",
  {
    get: function()
    {
      if (_categories.includes("Ranged"))
      {
        return "ranged";
      }

      else return "melee";
    },
    enumerable: true
  });

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

  Object.defineProperty(this, "onHit",
  {
    get: function()
    {
      return _onHit;
    },
    enumerable: true
  });

  Object.defineProperty(this, "onDamage",
  {
    get: function()
    {
      return _onDamage;
    },
    enumerable: true
  });

  Object.defineProperty(this, "canRepel",
  {
    get: function()
    {
      return _canRepel;
    },
    enumerable: true
  });

  Object.defineProperty(this, "canCleave",
  {
    get: function()
    {
      return _canCleave;
    },
    enumerable: true
  });

  Object.defineProperty(this, "gripSpace",
  {
    get: function()
    {
      return _gripSpace;
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
      id: this.id,
      name: this.name,
      cost: this.cost,
      requiredSlots: this.requiredSlots,
      slotType: this.slotType,
      abilities: this.abilities,
      properties: this.properties,
      categories: this.categories,
      rarity: this.rarity,
      description: this.description,
      type: _type,
      damage: _damage,
      damageTypes: this.damageTypes,
      damageEffect: _damageEffect,
      reach: _reach,
      onHit: _onHit,
      onDamage: _onDamage,
      canRepel: _canRepel,
      canCleave: _canCleave,
      gripSpace: _gripSpace,
    };

    return obj;
  };

  this.hasDamageType = function(type)
  {
    if (_damageTypes.includes(type) === true)
    {
      return true;
    }

    else return false;
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

function SpecialAttack(data)
{
  var _id = data.id;
  var _name = data.name;
  var _type = "special attack";
  var _attack = data.attack || 0;
  var _defence = data.defence || 0;
  var _damage = data.damage || 0;
  var _damageTypes = data.damageTypes || ["untyped"];
  var _damageEffect = data.damageEffect || "damage";
  var _reach = data.reach || 0;
  var _onHit = data.onHit || null;
  var _onDamage = data.onDamage || null;
  var _description = data.description || "This special attack has no description";
  var _abilities = data.abilities || {};
  var _properties = data.properties || [];
  var _categories = data.categories || ["Miscellaneous"];

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

  Object.defineProperty(this, "description",
  {
    get: function()
    {
      return _description;
    },
    enumerable: true
  });

  Object.defineProperty(this, "type",
  {
    get: function()
    {
      return _type;
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

  Object.defineProperty(this, "weaponType",
  {
    get: function()
    {
      if (_categories.includes("Ranged"))
      {
        return "ranged";
      }

      else return "melee";
    },
    enumerable: true
  });

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

  Object.defineProperty(this, "onHit",
  {
    get: function()
    {
      return _onHit;
    },
    enumerable: true
  });

  Object.defineProperty(this, "onDamage",
  {
    get: function()
    {
      return _onDamage;
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

  Object.defineProperty(this, "properties",
  {
    get: function()
    {
      return _properties.slice();
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
      id: this.id,
      name: this.name,
      abilities: _abilities,
      properties: _properties,
      categories: _categories,
      description: _description,
      type: _type,
      damage: _damage,
      damageTypes: _damageTypes,
      damageEffect: _damageEffect,
      reach: _reach,
      onHit: _onHit,
      onDamage: _onDamage,
    };

    return obj;
  };

  this.hasProperty = function(property)
  {
    if (_properties.includes(property) === true)
    {
      return true;
    }

    else return false;
  };

  this.isOfCategory = function(category)
  {
    if (_categories.includes(category) === true)
    {
      return true;
    }

    else return false;
  };

  this.getAbility = function(key)
  {
    var total;

    if (_abilities != null)
    {
      for (var ab in _abilities)
      {
        if (key == ab && isNaN(_abilities[ab]) === false)
        {
          if (total === null)
          {
            total = _abilities[ab];
          }

          total += _abilities[ab];
        }
      }
    }

    //can be undefined, in which case the item does not have the ability.
    //This is because some abilities might have a zero value.
    return total;
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
