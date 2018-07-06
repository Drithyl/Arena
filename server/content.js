
var database;
const fs = require("fs");
var constructors;
var items;
var specialAttacks;
var forms;

module.exports =
{
  init: function(db, ctors)
  {
    database = db;
    constructors = ctors;
    items = loadJSONContent("./content/armors.json", "Item").concat
    (
      loadJSONContent("./content/consumables.json", "Item"),
      loadJSONContent("./content/shields.json", "Item"),
      loadJSONContent("./content/trinkets.json", "Item"),
      loadJSONContent("./content/weapons.json", "Item")
    );

    specialAttacks = loadJSONContent("./content/specialAttacks.json", "Item");
    forms = loadJSONContent("./content/forms.json", "Form");
    return this;
  },

  loadAccounts: function(cb)
  {
    database.find("accounts", {}, function(err, fetched)
    {
      if (err)
      {
        cb(err, null);
        return;
      }

      cb(null, fetched);
    });
  },

  loadCharacters: function(cb)
  {
    var characters = [];

    database.find("characters", {}, function(err, fetched)
    {
      if (err)
      {
        cb(err, null);
        return;
      }

      fetched.forEach(function(char)
      {
        //Revive forms by pointing them to the proper loaded form
        char.formList.forEach(function(form)
        {
          form = forms.find(function(revivedForm)
          {
            return form.id === revivedForm.id;
          });
        });

        //Revive equipped items by pointing them to the loaded items
        char.slotKeys.forEach(function(key)
        {
          char[key].forEach(function(slot)
          {
            if (slot.equipped != null)
            {
              slot.equipped = getOneItem("id", slot.equipped.id);
            }
          });
        });

        for (var key in char.specialAttacks)
        {
          char.specialAttacks[key] = getOneSpecialAttack("id", char.specialAttacks[key].id);
        }

        //revive the character using its constructor
        characters.push(new constructors.Character(char, char.formList));
      });

      cb(null, characters);
    });
  },

  getAllItems: function()
  {
    //clone to avoid tampering
    return items.slice(0);
  },

  getOneItem: function(query)
  {
    return items.find(function(item)
    {
      if (Object.keys(query).length < 1)
      {
        return true;
      }

      else return filterFn(item, query);
    });
  },

  getItems: function(query)
  {
    return items.filter(function(item)
    {
      if (Object.keys(query).length < 1)
      {
        return true;
      }

      else return filterFn(item, query);
    });
  },

  getAllForms: function()
  {
    return forms.slice(0);
  },

  getForms: function(query)
  {
    return forms.filter(function(item)
    {
      if (Object.keys(query).length < 1)
      {
        return true;
      }

      else return filterFn(item, query);
    });
  },

  getOneForm: function(query)
  {
    return forms.find(function(item)
    {
      if (Object.keys(query).length < 1)
      {
        return true;
      }

      else return filterFn(item, query);
    });
  },

  getAllSpecialAttacks: function()
  {
    //clone to avoid tampering
    return specialAttacks.slice(0);
  },

  getOneSpecialAttack: function(query)
  {
    return specialAttacks.find(function(specialAttack)
    {
      if (Object.keys(query).length < 1)
      {
        return true;
      }

      else return filterFn(specialAttack, query);
    });
  },

  getSpecialAttacks: function(query)
  {
    return specialAttacks.filter(function(specialAttack)
    {
      if (Object.keys(query).length < 1)
      {
        return true;
      }

      else return filterFn(specialAttack, query);
    });
  }
}

function loadEquipment(cb)
{
  var equipments = [];

  database.find("equipment", {}, function(err, fetched)
  {
    if (err)
    {
      cb(err, null);
      return;
    }

    fetched.forEach(function(equip)
    {
      equipments.push(JSON.parse(equip, Reviver));
    });

    cb(null, equipments);
  });
}

function loadJSONContent(path, ctorName)
{
  if (fs.existsSync(path) === false)
  {
    throw new Error("The path '" + path + "' does not exist.");
  }

  return contentReviver(ctorName, JSON.parse(fs.readFileSync(path, "utf8")));
}


/************************************************************************************************
*   THE REVIVER AND JSON METHODS WERE TAKEN FROM:                                               *
*   https://stackoverflow.com/questions/8111446/turning-json-strings-into-objects-with-methods  *
************************************************************************************************/

// A generic "smart reviver" function.
// Looks for object values with a `ctor` property and
// a `data` property. If it finds them, and finds a matching
// constructor that has a `fromJSON` property on it, it hands
// off to that `fromJSON` fuunction, passing in the value.
function Reviver(key, value)
{
  var ctor;

  if (typeof value === "object" &&
      typeof value.ctor === "string" &&
      typeof value.data !== "undefined")
  {
    ctor = constructors[value.ctor] || window[value.ctor];

    if (typeof ctor === "function")
    {
      if (typeof ctor.fromJSON === "function")
      {
        return ctor.fromJSON(value);
      }

      else return Generic_fromJSON(ctor, value);
    }
  }

  return value;
}

function contentReviver(ctorName, parsedData)
{
  var revivedData = [];
  var ctor = constructors[ctorName];

  for (var item in parsedData)
  {
    if (ctor == null || typeof ctor !== "function")
    {
      revivedData.push(parsedData[item]);
    }

    else if (typeof ctor.fromJSON === "function")
    {
      revivedData.push(ctor.fromJSON(parsedData[item]));
    }

    else
    {
      //instantiate constructor and assign the parsed data
      revivedData.push(new ctor(parsedData[item]));
    }
  }

  return revivedData;
}

function toJSON(ctorName, obj, keys)
{
  if (typeof obj.toJSON === "function")
  {
    return {ctor: ctor, data: obj.toJSON()};
  }

  else return Generic_toJSON(ctorName, obj, keys);
}

// A generic "toJSON" function that creates the data expected
// by Reviver.
// `ctorName`  The name of the constructor to use to revive it
// `obj`       The object being serialized
// `keys`      (Optional) Array of the properties to serialize,
//             if not given then all of the objects "own" properties
//             that don't have function values will be serialized.
//             (Note: If you list a property in `keys`, it will be serialized
//             regardless of whether it's an "own" property.)
// Returns:    The structure (which will then be turned into a string
//             as part of the JSON.stringify algorithm)
function Generic_toJSON(ctorName, obj, keys)
{
  var data, index, key;

  if (!keys)
  {
    keys = Object.keys(obj); // Only "own" properties are included
  }

  data = {};

  for (index = 0; index < keys.length; ++index)
  {
    key = keys[index];
    data[key] = obj[key];
  }

  return {ctor: ctorName, data: JSON.stringify(data)};
}

// A generic "fromJSON" function for use with Reviver: Just calls the
// constructor function with no arguments, then applies all of the
// key/value pairs from the raw data to the instance. Only useful for
// constructors that can be reasonably called without arguments!
// `ctor`      The constructor to call
// `data`      The data to apply
// Returns:    The object
function Generic_fromJSON(ctor, data)
{
  var obj, name;

  obj = new ctor();

  for (name in data)
  {
    obj[name] = data[name];
  }

  return obj;
}

function filterFn(item, filter)
{
  for (var key in filter)
  {
    var value = filter[key];

    if (Array.isArray(item[key]) === true && item[key].includes(value) === true)
    {
      return true;
    }

    else if (typeof item[key] === "string" && item[key] === value)
    {
      return true;
    }

    else if (isNaN(item[key]) === false && item[key] === value)
    {
      return true;
    }

    else if (typeof item[key] === "object" && item[key][value] != null)
    {
      return true;
    }
  }

  return false;
}
