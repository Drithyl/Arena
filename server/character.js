
const dice = require("./dice.js");
//const affliction = require("./affliction.js");
const ruleset = require("./ruleset.js");
var keys;
var forms;
var content;
var itemEffectsOnCharacter;
var itemPropsOnCharacter;

module.exports =
{
  init: function(contentModule, index)
  {
    keys = index;
    content = contentModule;
    forms = require("./forms.js").init(contentModule, index);

    itemEffectsOnCharacter =
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

    itemPropsOnCharacter =
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

    return this;
  }
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
      equipped[i] = content.getItems({key: keys.ID, value: equipped[i][keys.ID]})[0];
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

function giveEnemyData(t = this)
{
  var data = {};
  data[keys.ID] = t[keys.ID];
  data[keys.NAME] = t[keys.NAME];
  data[keys.PLAYER] = t[keys.PLAYER];
  data[keys.LVL] = t[keys.LVL];
  data[keys.FORM] = t[keys.FORM][keys.NAME];
  data[keys.SIZE] = t[keys.SIZE];
  data[keys.SLOT_LIST] = {};

  for (var slot in t[keys.SLOT_LIST])
  {
    data[keys.SLOT_LIST][slot] = {[keys.EQUIPPED]: {}};

    for (var key in t[keys.SLOT_LIST][slot][keys.EQUIPPED])
    {
      var item = t[keys.SLOT_LIST][slot][keys.EQUIPPED][key];
      data[keys.SLOT_LIST][slot][keys.EQUIPPED][key] = item[keys.NAME];
    }
  }

  return data;
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
  //TODO: update protection stats
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
  //TODO: update protection stats
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
