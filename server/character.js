
const dice = require("./dice.js");
//const affliction = require("./affliction.js");
const ruleset = require("./ruleset.js");
var keys;
var forms;

var itemEffectsOnCharacter =
[
  keys.EFF.ALL_WATERBREATHING,
  keys.EFF.REINVIG,
  keys.EFF.INSPIRATION,
  keys.EFF.FEAR,
  keys.EFF.AWE,
  keys.EFF.ANIMAL_AWE,
  keys.EFF.UP_HEAL,
  keys.EFF.POISON_BARBS,
  keys.EFF.RECUP,
  keys.EFF.BONUS.SIEGE,
  keys.EFF.BONUS.FORGE,
  keys.EFF.BONUS.HEAL,
  keys.EFF.BONUS.SUPPLY,
  keys.EFF.RES.FIRE,
  keys.EFF.RES.COLD,
  keys.EFF.RES.POISON,
  keys.EFF.RES.SHOCK
];

var itemPropsOnCharacter =
[
  keys.PROPS.BLIND,
  keys.PROPS.ETHEREAL,
  keys.PROPS.NO_EAT,
  keys.PROPS.RECUP,
  keys.PROPS.AMPHIBIAN,
  keys.PROPS.POOR_AMPH,
  keys.PROPS.TRAMPLE,
  keys.PROPS.NO_HEAL,
  keys.PROPS.GLAMOUR,
  keys.PROPS.FLY,
  keys.PROPS.BLINDFIGHTER,
  keys.PROPS.SACRED,
  keys.PROPS.IMMORTAL,
  keys.PROPS.STORM_FLY,
  keys.PROPS.TELEPORT,
  keys.PROPS.TWIST_FATE,
  keys.PROPS.SKIN.BARK,
  keys.PROPS.SKIN.STONE,
  keys.PROPS.SKIN.IRON,
  keys.PROPS.SURV.FOREST,
  keys.PROPS.SURV.MOUNTAIN,
  keys.PROPS.SURV.WASTE,
  keys.PROPS.SURV.SWAMP
];

module.exports =
{
  db: null,
  content: null,
  keys: null,
  list: null,
  namesTaken: [],

  init: function(database, contentModule, index, charsFetched)
  {
    keys = index;
    this.db = database;
    this.content = contentModule;
    this.list = charsFetched;
    forms = require("./forms.js").init(contentModule, index);

    for (var i = 0; i < this.list.length; i++)
    {
      this.namesTaken.push(this.list[i][keys.NAME]);
    }

    return this;
  },

  addCharacter: function(characters, cb)
  {
    if (Array.isArray(characters) === false)
    {
      characters = [characters];
    }

    db.insert("characters", characters, function(err, res)
    {
      if (err)
      {
        cb(err.name + ": in addCharacter(): " + err.message, null);
        return;
      }

      for (var i = 0; i < characters.length; i++)
      {
        this.namesTaken.push(characters[i][keys.NAME]);
      }

      cb(null);
    });
  },

  registerCharacters: function(charactersData, player, cb)
  {
    var verifiedArr = [];
    player.characters = {};

    for (var i = 0; i < charactersData.length; i++)
    {
      try
      {
        verifyCharacterData(charactersData[i]);
        var character = buildCharacter(charactersData[i], player.username);
        this.namesTaken.push(character[keys.NAME]);
        verifiedArr.push(character);
        player.characterKeys.push(character.id);
      }

      catch (err)
      {
        cb(err, null);
      }
    }

    db.insert("players", player, function(err, res)
    {
      if (err)
      {
        cb(err.name + ": in registerCharacters(): " + err.message, null);
        return;
      }

      db.insert("characters", verifiedArr, function(err, res)
      {
        if (err)
        {
          cb(err.name + ": in registerCharacters(): " + err.message, null);
          return;
        }

        this.namesTaken.concat(namesArr);
        cb(null, verifiedArr);
      });
    });
  },

  /*
  * Reattach the relevant data to the characters that a username owns on server
  * launch and then return an object of those characters accessible through
  * their ids.  Arguments:
  *
  *    username       the username of the player that owns the characters
  *
  * This function may fail for several reasons:
  *
  *    NotFound       No character belonging to this username is found. In this
  *                   case, no return object will be supplied.
  */

  reviveCharacters: function(username)
  {
    var obj = {};

    var characters = this.list.filter(function(char)
    {
      return char[keys.PLAYER] == username;
    });

    if (characters == null || characters.length == null || characters.length <= 0)
    {
      throw new Error("No characters for username " + username + " were found.");
    }

    for (var i = 0; i < characters.length; i++)
    {
      reviveContent(characters[i]);
      attachFunctions(characters[i]);
      obj[characters[i].id] = characters[i];
    }

    return obj;
  },

  /*
  * Save the characters state in the database. This will be only called by the
  * players module function save(). Some of the properties of the characters
  * that must not be saved (unnecessary data stored in JSON content files)
  * are converted into their id, such as item objects, and are revived into
  * their proper object through the id whenever the server is launched.
  * Arguments:
  *
  *   characters     The object within the .characters key of a player object,
  *                  containing the current state of each character.
  *
  *   cb             The callback function called once the saving is done, or
  *                  when an error occurs.
  *
  * This function may fail for several reasons:
  *
  *   DBError        The attempt to save one of the characters in the database
  *                  threw an error, which is then passed into the callback.
  */

  saveCharacters: function(characters, cb)
  {
    var arr = [];

    for (var id in characters)
    {
      var clone = characters[id].functionless();
      lullContent(clone);
      arr.push(clone);
    }

    db.save("characters", arr, function(err, res)
    {
      if (err)
      {
        cb(err.name + ": in saveCharacters(): " + err.message, null);
        return;
      }

      cb(null, res);
    });
  }
}

function buildCharacter(verifiedData, player)
{
  var obj = {};
  var race = content.getForms({key: keys.NAME, value: verifiedData.race});

  obj[keys.NAME] = verifiedData.name;
  obj[keys.ID] = generateID();
  obj[keys.PLAYER] = player;
  obj[keys.TRANS_POINTS] = 0;
  obj[keys.FORM] = race[keys.ID];
  obj[keys.CURR_FORM] = race[keys.ID];
  obj[keys.ALL_FORMS] = race[keys.ALL_FORMS];
  obj[keys.MAX_HP] = verifiedData[keys.MAX_HP];
  obj[keys.CURR_HP] = obj[keys.MAX_HP] + race[keys.MAX_HP];
  obj[keys.MR] = verifiedData[keys.MR];
  obj[keys.MRL] = verifiedData[keys.MRL];
  obj[keys.STR] = verifiedData[keys.STR];
  obj[keys.ATK] = 0;
  obj[keys.DEF] = 0;
  obj[keys.PRC] = 0;
  obj[keys.AP] = 0;
  obj[keys.MP] = 0;
  obj[keys.SPEED] = 0;
  obj[keys.AFFL_LIST] = {};
  obj[keys.PATH_LIST] = {};
  obj[keys.PROP_LIST] = [];
  obj[keys.AB_LIST] = {};
  obj[keys.PART_LIST] = race[keys.PART_LIST];

  for (var key in keys.SLOT_LIST)
  {
    obj[keys.SLOT_LIST[key]] = {};
    obj[keys.SLOT_LIST[key]][keys.EQUIPPED] = [];
    obj[keys.SLOT_LIST[key]][keys.FREE] = race[keys.SLOT_LIST][keys.SLOT_LIST[key]];
    obj[keys.SLOT_LIST[key]][keys.TOTAL] = race[keys.SLOT_LIST][keys.SLOT_LIST[key]];
  }

  return obj;
}

/*
* Puts some of the character object's content to sleep, as in replacing it for
* its IDs (in the case of equipped items and forms) or base values (for protection),
* so as to save the character into the database. These content objects will be
* revived again on server launch (see reviveContent()). Arguments:
*
*   char           The character object that must be lulled.
*/

function lullContent(char)
{
  char.lullItemEffects(itemEffectsOnCharacter, itemPropsOnCharacter);
  char.lullProtection();
  char.lullSlots();
  char.lullForms();
}

function lullProtection(t = this)
{
  for (var part in keys.PARTS)
  {
    t[keys.PRT_LIST][keys.PARTS[part]] = t[keys.FORM][keys.PRT_LIST][keys.PARTS[part]];
  }
}

function lullSlots(t = this)
{
  for (var slot in keys.SLOTS)
  {
    var equipped = char[keys.SLOT_LIST][keys.SLOTS[slot]][keys.EQUIPPED];

    for (var i = 0; i < equipped.length; i++)
    {
      equipped[i] = equipped[i][keys.ID];
    }
  }
}

function lullForms(t = this)
{
  t[keys.FORM] = t[keys.FORM][keys.ID];

  for (var i = 0; i < t[keys.ALL_FORMS].length; i++)
  {
    t[keys.ALL_FORMS][i] = t[keys.ALL_FORMS][i][keys.ID];
  }
}

/*
* Unloads the effects and properties that equipped items are transferring to
* the character, usually for the purpose of saving the character in the database.
* To determine which effects and properties might have been loaded, the function
* uses the array Arguments:
*
*   effectsFilter An array listing the keys of effects to be removed.
*
*   propsFilter   An array listing the keys of properties to be removed.
*
*   t             The character object that must be lulled, just a shorthand for the
*                 default 'this', since it will mostly be called like so:
*                 character.lullItemEffects()
*/

function lullItemEffects(effectsFilter, propsFilter, t = this)
{
  for (var slot in keys.SLOTS)
  {
    for (var id in t[keys.SLOTS[slot]][keys.EQUIPPED])
    {
      var item = t[keys.SLOTS[slot]][keys.EQUIPPED][id];
      removeItemEffects(item, itemEffectsOnCharacter, itemPropsOnCharacter, t);
    }
  }
}

/*
* Revives the relevant properties of a character for ease of access during runtime,
* such as grabbing the item objects that the character has equipped, or calculating
* the different total protection values of each bodypart. Arguments:
*
*   char           The character object that must be lulled.
*/

function reviveContent(char)
{
  char.reviveSlots();
  char.reviveForms();
  char.reviveProtection();  //must go last
  char.reviveItemEffects(itemEffectsOnCharacter, itemPropsOnCharacter);
}

function reviveSlots(t = this)
{
  for (var slot in keys.SLOTS)
  {
    var equipped = char[keys.SLOT_LIST][keys.SLOTS[slot]][keys.EQUIPPED];

    for (var i = 0; i < equipped.length; i++)
    {
      equipped[i] = content.getItems({key: keys.ID, value: equipped[i][keys.ID])[0];
    }
  }
}

function reviveForms(t = this)
{
  t[keys.FORM] = forms.create(t[keys.FORM]);

  for (var i = 0; i < t[keys.ALL_FORMS].length; i++)
  {
    t[keys.ALL_FORMS][i] = forms.create(t[keys.ALL_FORMS][i]);
  }
}

/*
* Transfers the effects and properties of equipped items to the character for ease
* of use during runtime (rather than having to search for them in both characters
* and items). Arguments:
*
*   effectsFilter An array listing the keys of effects to be applied.
*
*   propsFilter   An array listing the keys of properties to be applied.
*
*   t             The character object that must be lulled, just a shorthand for the
*                 default 'this', since it will mostly be called like so:
*                 character.lullItemEffects()
*/

function reviveItemEffects(effectsFilter, propsFilter, t = this)
{
  for (var slot in keys.SLOTS)
  {
    for (var id in t[keys.SLOTS[slot]][keys.EQUIPPED])
    {
      var item = t[keys.SLOTS[slot]][keys.EQUIPPED][id];
      applyItemEffects(item, itemEffectsOnCharacter, itemPropsOnCharacter, t);
    }
  }
}

/*
* Transfers to the character the effects and properties of a single equipped
* item. Arguments:
*
*   item          The item that contains the effects to apply.
*
*   effectsFilter An array listing the keys of effects to be applied.
*
*   propsFilter   An array listing the keys of properties to be applied.
*
*   char          The character object from which to remove the effects.
*/

function applyItemEffects(item, effectsFilter, propsFilter, char)
{
  for (eff in item[keys.EFF_LIST])
  {
    if (itemEffectsOnCharacter.includes(eff) === false)
    {
      continue;
    }

    if (char[keys.AB_LIST][eff] == null)
    {
      char[keys.AB_LIST][eff] = item[keys.EFF_LIST][eff];
    }

    else char[keys.AB_LIST][eff] += item[keys.EFF_LIST][eff];
  }

  for (prop in item[keys.PROP_LIST])
  {
    if (itemPropsOnCharacter.includes(prop) === false)
    {
      continue;
    }

    if (char[keys.PROP_LIST].includes(prop) === false)
    {
      char[keys.PROP_LIST].push(item[keys.PROP_LIST][prop]);
    }
  }
}

/*
* Removes the effects and properties of an item applied to a character. Arguments:
*
*   item          The item that contains the effects to remove.
*
*   effectsFilter An array listing the keys of effects to be removed.
*
*   propsFilter   An array listing the keys of properties to be removed.
*
*   char          The character object from which to remove the effects.
*/

function removeItemEffects(item, effectsFilter, propsFilter, char)
{
  for (eff in item[keys.EFF_LIST])
  {
    if (itemEffectsOnCharacter.includes(eff) === false)
    {
      continue;
    }

    char[keys.AB_LIST][eff] -= item[keys.EFF_LIST][eff];

    if (char[keys.AB_LIST][eff] === 0)
    {
      delete char[keys.AB_LIST][eff];
    }
  }

  for (prop in item[keys.PROP_LIST])
  {
    if (itemPropsOnCharacter.includes(prop) === false)
    {
      continue;
    }

    char[keys.PROP_LIST].splice(char[keys.PROP_LIST].indexOf(item[keys.PROP_LIST][prop]), 1);
  }
}

/*
* Verify the data of a single character sent by a client on character creation
* to make sure that it is valid. Arguments:
*
*   data            The character data. It is supposed to contain a string .name
*                   property, a string .race property, and a subObject
*                   .attributes, with a collection of the attribute keys and
*                   integer values that the client invested.
*
* This function may fail for several reasons:
*
*   RaceError       The race in .race could not be found within the content.
*
*   NameError       The character name is incorrect. It might not be a string,
*                   contain invalid characters, be too short or too long.
*
*   AttributesError One or more of the attributes either does not exist, or
*                   is not a number, or the client somehow invested more points
*                   than his chosen race allows.
*/

function verifyCharacterData(data)
{
  var chosenRace = content.getForms({key: keys.NAME, value: char.race});

  if (chosenRace === null || chosenRace.length <= 0)
  {
    throw "The chosen race is invalid. Please choose only from the given options.";
  }

  try
  {
    verifyName(data.name);
    verifyAttributes(chosenRace, data.attributes);
  }

  catch (err)
  {
    throw err;
  }
}

function verifyName(name)
{
	if (typeof name !== "string")
	{
		throw "The name must be a string of text.";
	}

  else if (/\S+/.test(name) === false)
  {
    throw "The name must not be left empty.";
  }

  else if (/[\(\)\{\}\[\]\!\?\@\#\$\%\^]/.test(name) === true)
  {
    throw "The name must not contain special characters other than spaces, dashes or underscores.";
  }

  else if (name.length > 36)
  {
    throw "The name must be 36 characters or less in length.";
  }

  if (this.namesTaken.includes(name.toLowerCase()) === true)
  {
    throw "The name is already taken by another character.";
  }
}

function verifyAttributes(race, attributes)
{
  var maxPoints = race[keys.START_POINTS];
  var pointsUsed = 0;

  for (var key in attributes)
  {
    if (race[key] == null)
    {
      throw "The attribute " + key + " is invalid. It does not exist.";
    }

    if (isNaN(attributes[key]) === true)
    {
      throw "The attribute " + key + " must be an integer.";
    }

    pointsUsed += attributes[key];

    if (pointsUsed > maxPoints)
    {
      throw "You have invested more points than your race allows.";
    }
  }
}

function generateID()
{
  //line borrowed from https://gist.github.com/gordonbrander/2230317
  var id = '_' + Math.random().toString(36).substr(2, 9);

  while (module.exports.list.filter(function(char) {  return char.id == id;  }).length > 0)
  {
    id = '_' + Math.random().toString(36).substr(2, 9);
  }

  return id;
}

function attachFunctions(character)
{
  //TODO
}

function battleReady(t = this)
{
  t.battle = {};
  t.battle.position = {};
  t.battle[keys.FAT] = 0;
  t.battle.status = {};
  t.battle.status[keys.STATUS.HARASS] = 0;
  t.battle[keys.AP] = getTotalAttribute(keys.AP, t);
}

function ignite(pack, result, t = this)
{
  var igniteChance = pack.data.damage * 5;
	var roll = Math.floor((Math.random() * 100)) + 1;

	if (roll > igniteChance)
	{
		return false;
	}

	if (pack.damageType == keys.DMG_TYPE.FIRE)
	{
		t.battle.status[keys.DMG_TYPE.FIRE] = true;
	}

	else if (pack.damageType ==  keys.DMG_TYPE.COLD)
	{
		t.battle.status[keys.DMG_TYPE.COLD] = true;
	}

  return true;
}

function addFatigue(amount, t = this)
{
  var result = {fatigueAdded: amount, damage: 0};
  t.battle.status[keys.FAT] += amount;

  if (t.battle.status[keys.FAT] > 200)
  {
    result.fatigueAdded -= t.battle.status[keys.FAT] - 200;
    result.fatigueDamage = Math.floor((t.battle.status[keys.FAT] - 200) / 5);
    t.battle.status[keys.FAT] = 200;
    reduceHP(result.fatigueDamage, t);
  }

  if (t.battle.status[keys.FAT] >= 100)
  {
    delete t.battle.status[keys.STATUS.BERSERK];
    t.battle.status[keys.STATUS.UNCONSCIOUS] = true;
  }

  return result;
}

function reduceHP(damage, t = this)
{
  var result = {"finalDamage": damage.cap(t[keys.CURR_HP]), shiftedShapeName: null};
  var changeShapeResult;

  t[keys.CURR_HP] -= result.finalDamage;

  if (t[keys.CURR_HP] === 0 && t[keys.ALL_FORMS].length > 0 && t[keys.CURR_FORM] < t[keys.ALL_FORMS].length - 1)
  {
    changeShapeResult = woundedShape(damage - finalDamage);
    result.finalDamage += changeShapeResult.finalDamage;
    result.shiftedShapeName = changeShapeResult.name;
  }

  return result;
}

function woundedShape(damageCarried, t = this)
{
  var maxHP;
  var result;

  t[keys.CURR_FORM]++;
  t[keys.FORM] = t[keys.ALL_FORMS][t[keys.CURR_FORM]];
  maxHP = getTotalAttribute(keys.MAX_HP, t);
  result = {"finalDamage": damageCarried.cap(t[keys.CURR_HP]), shiftedShapeName: t[keys.FORM][keys.NAME]};

  t[keys.CURR_HP] = (t[keys.CURR_HP] - damageCarried).lowerCap(0);

  if (t[keys.CURR_HP] === 0 && t[keys.ALL_FORMS].length > 0 && t[keys.CURR_FORM] < t[keys.ALL_FORMS].length - 1)
  {
    var nextResult = woundedShape(damageCarried - result.finalDamage, t);
    result.finalDamage += nextResult.finalDamage;
    result.shiftedShapeName = nextResult.shiftedShapeName;
  }

  result.droppedItems = updateSlots(t);
  return result;
}

function heal(amount, t = this)
{
  var maxHP = getTotalAttribute(keys.MAX_HP, t);
  var result = {"damageHealed": (maxHP - t[keys.CURR_HP]).cap(amount), shiftedShapeName: null};
  var revertShapeResult;

  t[keys.CURR_HP] += Math.floor(amount);

	if (t[keys.CURR_HP] === maxHP && t[keys.ALL_FORMS].length > 0 && t[keys.CURR_FORM] > 0)
	{
		revertShapeResult = healedShape(t[keys.CURR_HP] - maxHP, t);
    result.damageHealed += revertShapeResult.damageHealed;
    result.shiftedShapeName = revertShapeResult.shiftedShapeName;
	}

  return damageHealed;
}

function healedShape(healingCarried, t = this)
{
  var maxHP;
  var result;

  t[keys.CURR_FORM]--;
  t[keys.FORM] = t[keys.ALL_FORMS][t[keys.CURR_FORM]];
  maxHP = getTotalAttribute(keys.MAX_HP, t)
  result = {"damageHealed": healingCarried.cap(maxHP - t[keys.CURR_HP]), shiftedShapeName: t[keys.FORM][keys.NAME]};

  t[keys.CURR_HP] += result.damageHealed;

  if (t[keys.CURR_HP] === maxHP && t[keys.ALL_FORMS].length > 0 && t[keys.CURR_FORM] > 0)
  {
    var nextResult = healedShape(healingCarried - result.damageHealed, t);
    result.damageHealed += nextResult.damageHealed;
    result.shiftedShapeName = nextResult.shiftedShapeName;
  }

  result.droppedItems = updateSlots(t);
  return result;
}

function updateSlots(t = this)
{
  var droppedItems = [];

  for (var key in keys.SLOT_LIST)
  {
    var slot = [keys.SLOT_LIST[key]];
    var formTotal = race[keys.SLOT_LIST][keys.SLOT_LIST][slot];
    var charTotal = t[keys.SLOT_LIST][slot][keys.TOTAL];

    t[keys.SLOT_LIST][slot][keys.TOTAL] = formTotal;

    if (formTotal === charTotal)
    {
      continue;
    }

    else if (formTotal > charTotal)
    {
      t[keys.SLOT_LIST][slot][keys.FREE] += formTotal - charTotal;
    }

    else if (formTotal < charTotal)
    {
      droppedItems = droppedItems.concat(reduceSlots(slot, charTotal - formTotal, t));
    }
  }

  return droppedItems;
}

function reduceSlots(slotType, difference, t = this)
{
  var slotReqToFind = difference;
  var droppedItems = [];

  while (difference > 0)
  {
    for (var key in t[keys.SLOT_LIST][slotType][keys.EQUIPPED])
    {
      var item = t[keys.SLOT_LIST][slotType][keys.EQUIPPED][key];

      if (item[keys.REQ_SLOTS] === slotReqToFind)
      {
        droppedItems.push(item[keys.NAME]);
        delete t[keys.SLOT_LIST][slotType][keys.EQUIPPED][key];
        difference -= slotReqToFind;
      }
    }

    slotReqToFind--;
  }

  return droppedItems;
}

function reduceFatigue(amount, t = this)
{
  var originalFat;
  var fatigueReduced = amount;

  if (t.battle == null || t.battle.status[keys.FAT] <= 0 || amount <= 0)
	{
		t.battle.status[keys.FAT] = 0;
		return 0;
	}

  if (amount > t.battle.status[keys.FAT])
  {
    fatigueReduced -= amount - t.battle.status[keys.FAT];
  }

  fatigueReduced = Math.abs(amount - (t.battle.status[keys.FAT].lowerCap(0) - amount));
	originalFat = t.battle.status[keys.FAT];
	t.battle.status[keys.FAT] = (t.battle.status[keys.FAT] - amount).lowerCap(0);

	if (t.battle.status[keys.FAT] < 100 && originalFat >= 100)
	{
		delete t.battle.status[keys.STATUS.UNCONSCIOUS];
	}

  return fatigueReduced;
}

function reinvigorate(amount, t = this)
{
  var originalFat;

  if (t.battle == null)
	{
		return 0;
	}

  amount += getTotalAbility(keys.ABS.REINVIG, t);

	if (t.battle.status[keys.FAT] >= 100)
	{
		amount += 5; //Reinvigorate 5 if it's unconscious
	}

	if (amount > 0)
	{
		return reduceFatigue(amount, t);
	}

  else return 0;
}

function getProtectionRoll(weapon, target, hitLocation, damageType, t = this)
{
	var protection = target[keys.PRT_LIST][hitLocation][keys.TOTAL];

	if (weapon[keys.PROP_LIST].includes(keys.PROPS.A_NEGATE) === true)
	{
		return 0;
	}

  if (weapon[keys.PROP_LIST].includes(keys.PROPS.MAGICAL) === true)
  {
    //loses invulnerability protection
    protection -= target[keys.PRT_LIST][hitLocation][keys.PRT.INVUL];
  }

	if (damageType == keys.DMG_TYPE.PIERCE)
	{
		protection = Math.floor(protection * 0.8);
	}

	if (weapon[keys.PROP_LIST].includes(keys.PROPS.A_PIERCE) === true)
	{
		protection = Math.floor(protection * 0.5);
	}

	protection += dice.DRN();
	return protection;
}

function getElementalResistance(type, t = this)
{
  var resistance = "";

  if (type == keys.DMG_TYPE.COLD)         resistance = keys.ABS.RES.COLD;
  else if (type == keys.DMG_TYPE.FIRE)    resistance = keys.ABS.RES.FIRE;
  else if (type == keys.DMG_TYPE.POISON)  resistance = keys.ABS.RES.POISON;
  else if (type == keys.DMG_TYPE.SHOCK)   resistance = keys.ABS.RES.SHOCK;

  return getTotalAbility(resistance, t);
}

function reviveProtection(t = this)
{
  for (var part in keys.PARTS)
  {
    var armor = getTotalArmor(keys.PARTS[part], t);
    var natural = getTotalNaturalArmor(keys.PARTS[part], t);
    var invulnerability = getTotalAbility(keys.ABS.INVUL);

    t[keys.PRT_LIST][keys.PARTS[part]] = {[keys.PRT.ARMOR]: armor,
                                          [keys.PRT.NATURAL]: natural,
                                          [keys.PRT.INVUL]: invulnerability,
                                          [keys.TOTAL]: armor + natural + invulnerability};
  }
}

function getTotalArmor(part, t = this)
{
  var total = 0;

  for (var slot in keys.SLOTS)
  {
    for (var id in t[keys.SLOTS[slot]][keys.EQUIPPED])
    {
      var item = t[keys.SLOTS[slot]][keys.EQUIPPED][id];

      if (item[keys.PRT_LIST][part] == null || item[keys.PRT_LIST][part] === 0 || isNaN(item[keys.PRT_LIST][part]) === true)
      {
        continue;
      }

      total += item[keys.PRT_LIST][part];
    }
  }

  return total;
}

function getTotalNaturalArmor(part, t = this)
{
  return (t[keys.FORM][keys.PRT_LIST][part] || 0) + getTotalAbility(keys.PRT.NATURAL);
}

function checkProperty(key, t = this)
{
  if (t[keys.PROP_LIST].includes(key) === true)
  {
    return true;
  }

  else return false;
}

/*
* Returns the total sum of a character's stat (a stat being strength, HP, MR, etc;
* essentially one of the properties that *every* character has). This includes
* whatever bonuses items equipped might give. Arguments:
*
*   t             The character object that must be lulled, just a shorthand for the
*                 default 'this', since it will mostly be called like so:
*                 character.lullItemEffects()
*/

function getDualPenalty(t = this)
{
  var total = 0;

  for (var slot in keys.SLOTS)
  {
    for (var id in t[keys.SLOTS[slot]][keys.EQUIPPED])
    {
      var item = t[keys.SLOTS[slot]][keys.EQUIPPED][id];

      if (item[keys.DMG] == null || item[keys.LEN] == null)
      {
        //not a weapon
        continue;
      }

      if (item[keys.PROP_LIST].includes(keys.EXTRA) === true)
      {
        //"Extra" weapons like
        continue;
      }

      total += item[keys.LEN] || 0;
    }
  }

  return (total - (t[keys.AB_LIST][keys.ABS.AMBIDEXTROUS] || 0)).lowerCap(0);
}

function getTotalAttribute(key, t = this)
{
  return (t[keys.FORM][key] || 0) + (t[key] || 0) + getEquippedAbility(key, t);
}

function getEquippedAbility(key, t = this)
{
  var total = 0;

  for (var slot in keys.SLOTS)
  {
    for (var id in t[keys.SLOTS[slot]][keys.EQUIPPED])
    {
      var item = t[keys.SLOTS[slot]][keys.EQUIPPED][id];

      if (item[key] != null && isNaN(item[key]) === false)
      {
        total += item[key];
      }

      if (item[keys.EFF_LIST][key] != null || isNaN(item[keys.EFF_LIST][key]) === false)
      {
        total += item[keys.EFF_LIST][key];
      }
    }
  }

  return total;
}

function getTotalAbility(key, t = this)
{
  var total = 0;

  for (var ability in t[keys.AB_LIST])
  {
    if (key == ability && isNaN(t[keys.AB_LIST][ability]) === false)
    {
      total += t[keys.AB_LIST][ability];
    }
  }

  return total;
}

function getEquippedWeapons(t = this)
{
  var weapons = [];

  for (var slot in keys.SLOTS)
  {
    for (var id in t[keys.SLOTS[slot]][keys.EQUIPPED])
    {
      var item = t[keys.SLOTS[slot]][keys.EQUIPPED][id];

      if (item[keys.DMG] != null)
      {
        weapons.push(item);
      }
    }
  }

  return weapons;
}

function getEquippedItem(id, t = this)
{
  var list = [];

  for (var slot in keys.SLOTS)
  {
    for (var id in t[keys.SLOTS[slot]][keys.EQUIPPED])
    {
      var item = t[keys.SLOTS[slot]][keys.EQUIPPED][id];

      if (item[keys.ID] === id)
      {
        list.push(item);
      }
    }
  }

  return list;
}

function getAttacks(id, t = this)
{
  return actor.getEquippedItem(id, t).concat(t[keys.FORM].getNaturalAttacks(id));
}

function hasAttack(id, t = this)
{
  for (var slot in keys.SLOTS)
  {
    for (var id in t[keys.SLOTS[slot]][keys.EQUIPPED])
    {
      var item = t[keys.SLOTS[slot]][keys.EQUIPPED][id];

      if (item[keys.ID] === id)
      {
        return true;
      }
    }
  }

  return t[keys.FORM].hasNaturalAttack(id);
}
