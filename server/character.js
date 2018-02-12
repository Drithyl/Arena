
const dice = require("./dice.js");
//const affliction = require("./affliction.js");
const ruleset = require("./ruleset.js");
var keys;

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

    for (var i = 0; i < this.list.length; i++)
    {
      this.namesTaken.push(this.list[i][keys.NAME]);
    }
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

  registerCharacters: function(chars, player, cb)
  {
    var verifiedArr = [];
    player.characters = {};

    for (var i = 0; i < chars.length; i++)
    {
      try
      {
        var verifiedChar = verifyChar(chars[i]);
        this.namesTaken.push(verifiedChar[keys.NAME]);
        verifiedChar.id = generateID();
        verifiedChar.player = player.username;
        verifiedArr.push(verifiedChar);
        player.characterKeys.push(verifiedChar.id);
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
      return char.player == username;
    });

    if (characters == null || characters.length == null || characters.length <= 0)
    {
      throw new Error("No characters for username " + username + " were found.");
    }

    for (var i = 0; i < characters.length; i++)
    {
      reviveContent(obj.characters[i]);
      attachFunctions(obj.characters[i]);
      obj.characters[characters[i].id] = characters[i];
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
      var alias = characters[id];
      alias[keys.FORM] = alias[keys.FORM][keys.ID];
      alias[keys.SLOT_LIST][keys.SLOTS.HANDS][keys.EQUIPPED] = alias[keys.SLOT_LIST][keys.SLOTS.HANDS][keys.EQUIPPED][keys.ID];
      alias[keys.SLOT_LIST][keys.SLOTS.HEAD][keys.EQUIPPED] = alias[keys.SLOT_LIST][keys.SLOTS.HEAD][keys.EQUIPPED][keys.ID];
      alias[keys.SLOT_LIST][keys.SLOTS.BODY][keys.EQUIPPED] = alias[keys.SLOT_LIST][keys.SLOTS.BODY][keys.EQUIPPED][keys.ID];
      alias[keys.SLOT_LIST][keys.SLOTS.FEET][keys.EQUIPPED] = alias[keys.SLOT_LIST][keys.SLOTS.FEET][keys.EQUIPPED][keys.ID];
      alias[keys.SLOT_LIST][keys.SLOTS.MISC][keys.EQUIPPED] = alias[keys.SLOT_LIST][keys.SLOTS.MISC][keys.EQUIPPED][keys.ID];
      arr.push(alias);
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

function reviveContent(char)
{
  char[keys.FORM] = content.getForms(keys.ID, char[keys.FORM])[0];
  char[keys.SLOT_LIST][keys.SLOTS.HANDS][keys.EQUIPPED] = content.getWeapons(keys.ID, char[keys.SLOT_LIST][keys.SLOTS.HANDS][keys.EQUIPPED])[0];
  char[keys.SLOT_LIST][keys.SLOTS.HEAD][keys.EQUIPPED] = content.getArmors(keys.ID, char[keys.SLOT_LIST][keys.SLOTS.HEAD][keys.EQUIPPED])[0];
  char[keys.SLOT_LIST][keys.SLOTS.BODY][keys.EQUIPPED] = content.getArmors(keys.ID, char[keys.SLOT_LIST][keys.SLOTS.BODY][keys.EQUIPPED])[0];
  char[keys.SLOT_LIST][keys.SLOTS.FEET][keys.EQUIPPED] = content.getTrinkets(keys.ID, char[keys.SLOT_LIST][keys.SLOTS.FEET][keys.EQUIPPED])[0];
  char[keys.SLOT_LIST][keys.SLOTS.MISC][keys.EQUIPPED] = content.getTrinkets(keys.ID, char[keys.SLOT_LIST][keys.SLOTS.MISC][keys.EQUIPPED])[0];
}

function verifyChar(char)
{
  var chosenRace = content.getForms(keys.NAME, char.race);

  if (chosenRace === null || chosenRace.length <= 0)
  {
    throw "The chosen race is invalid. Please choose only from the given options.";
  }

  try
  {
    verifyCharName(data.name);
    verifyScores(chosenRace, data.attributes);
  }

  catch (err)
  {
    throw err;
  }

  return char;
}

function verifyCharName(name)
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

function verifyScores(race, scores)
{
  var points = race[keys.START_POINTS];

  for (var key in keys.CHAR)
  {
    if (isNaN(race[key]) === false && isNaN(scores[key]) === false &&
        scores[key] < race[key])
    {
      throw "The " + key + " score is too low. It cannot go under the race's minimum.";
    }

    if (keys.ATTR[key] == null)
    {
      if (scores[key] !== race[key])
      {
        throw "The " + key + " value cannot be different from that of the race.";
      }

      else continue;
    }

    if (scores[key] > race[key])
    {
      var diff = scores[key] - race[key];
      points -= diff;

      if (points < 0)
      {
        return false;
      }
    }
  }

  return true;
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
  character.toClient = toClient;
  character.abstract = abstract;
  character.battleReady = battleReady;
  character.printCharSheet = printCharSheet;
  character.printEquipment = printEquipment;
  character.printVault = printVault;
  character.printTasks = printTasks;
  character.raiseXP = raiseXP;
  character.raiseHP = raiseHP;
  character.raiseProt = raiseProt;
  character.raiseStat = raiseStat;
  character.nextLvlXP = nextLvlXP;
  character.nextLvlPointCost = nextLvlPointCost;
  character.getLevelledProps = getLevelledProps;
  character.getForm = getForm;
  character.getVault = getVault;
  character.hasEnoughCurrency = hasEnoughCurrency;
  character.transaction = transaction;
  character.buy = buy;
  character.sell = sell;
  character.equip = equip;
  character.prepareIntrinsic = prepareIntrinsic;
  character.use = use;
  character.dropItem = dropItem;
  character.dropSlots = dropSlots;
  character.unequipItem = unequipItem;
  character.unequipSlots = unequipSlots;
  character.cleanSlots = cleanSlots;
  character.hasEquipped = hasEquipped;
  character.hasInVault = hasInVault;
  character.hasHealableAffl = hasHealableAffl;
  character.isHealthy = isHealthy;
  character.storeInVault = storeInVault;
  character.removeFromVault = removeFromVault;
  character.lesserRecuperate = lesserRecuperate;
  character.recuperate = recuperate;
  character.heal = heal;
  character.drain = drain;
  character.applyDmg = applyDmg;
  character.ignite = ignite;
  character.tickPoison = tickPoison;
  character.tickCold = tickCold;
  character.tickFire = tickFire;
  character.escapeWeb = escapeWeb;
  character.endEffects = endEffects;
  character.changeShape = changeShape;
  character.revertShape = revertShape;
  character.reduceHP = reduceHP;
  character.calcAffliction = calcAffliction;
  character.loseSlot = loseSlot;
  character.addFatigue = addFatigue;
  character.reinvigorate = reinvigorate;
  character.getSlotsNbr = getSlotsNbr;
  character.getWeapons = getWeapons;
  character.getRepelWeapons = getRepelWeapons;
  character.getAttacks = getAttacks;
  character.getRepels = getRepels;
  character.getEquippedWeapons = getEquippedWeapons;
  character.getIntrinsicWeapons = getIntrinsicWeapons;
  character.getUnusableParts = getUnusableParts;
  character.getGoldFactor = getGoldFactor;
  character.getGemFactor = getGemFactor;
  character.getTrainFactor = getTrainFactor;
  character.getSharesHealingFactor = getSharesHealingFactor;
  character.getFinalHealingFactor = getFinalHealingFactor;
  character.getRecupFactor = getRecupFactor;
  character.getTtlHP = getTtlHP;
  character.getTtlShapeHP = getTtlShapeHP;
  character.getTtlProt = getTtlProt;
  character.getTtlShieldProt = getTtlShieldProt;
  character.getTtlAtt = getTtlAtt;
  character.getDualPen = getDualPen;
  character.getTtlDef = getTtlDef;
  character.getTtlParry = getTtlParry;
  character.getTtlStr = getTtlStr;
  character.getTtlMR = getTtlMR;
  character.getTtlMor = getTtlMor;
  character.getTtlPrec = getTtlPrec;
  character.getTtlEnc = getTtlEnc;
  character.getTtlPath = getTtlPath;
  character.getTtlReinvig = getTtlReinvig;
  character.getTtlRes = getTtlRes;
  character.checkProp = checkProp;
  character.printPaths = printPaths;
}

function battleReady(t = this)
{
  t.battle = {};
  t.battle.position = [];
  t.battle[keys.FAT] = 0;
  t.battle.status = {};
  t.battle.equippedWpns = t[keys.SLOTS.HANDS].equipped.slice(0);
}

function damageArc(weapon, pack, result, t = this)
{
	damageCheck(weapon, pack, result);

  if (result.damage < 0)
  {
    result.failed = true;
  }

	inflictDamage(pack, result, (weapon[ids.PROPS][ids.STUN]) ? true : false);

  if (pack.data.canAfflict === true)
  {
    affliction.apply(weapon, pack, result);
  }
}

function inflictDamage(pack, result, isStun)
{
  if (type == keys.DMG_TYPE.WEB)
	{
		pack.target.battle.status[keys.DMG_TYPE.WEB] = pack.data.damage;
	}

	else if (type == keys.DMG_TYPE.STUN || isStun === true)
	{
    var res = pack.target.addFatigue(pack.data.damage);
    result.damageInflicted = res.fatigueDamage;
    result.fatigueInflicted = res.fatigueAdded;
	}

	else if (type == keys.DMG_TYPE.POISON)
	{
		pack.target.battle.status[ids.DMG_TYPE.POISON] = ((pack.target.battle.status[ids.DMG_TYPE.POISON] || 0) + pack.data.damage).cap(Math.floor(pack.target[keys.MAX_HP]));
    result.damageInflicted = pack.target.battle.status[ids.DMG_TYPE.POISON] - pack.data.damage;
	}

	else if (type == keys.DMG_TYPE.COLD || type == keys.DMG_TYPE.FIRE)
	{
		result.damageInflicted = pack.target.reduceHP(pack.data.damage);
    result.remainingHP = pack.target[keys.CURR_HP];
    pack.data.remainingHP = result.remainingHP;
    pack.data.damageInflicted = result.damageInflicted;
    pack.data.canAfflict = true;
    pack.data.ignited = pack.target.ignite(pack, result);
	}

	else if (type == keys.DMG_TYPE.PARALYSIS)
	{
		result.damageInflicted = ruleset.calculateParalysis(pack.data.damage, pack.target);

		if (result.damageInflicted > 0)
		{
			pack.target.battle.status[keys.DMG_TYPE.PARALYSIS] = pack.target.battle.status[keys.DMG_TYPE.PARALYSIS] + result.damageInflicted || result.damageInflicted;
		}
	}

	else
	{
		result.damageInflicted = pack.target.reduceHP(pack.data.damage);
    result.remainingHP = pack.target[keys.CURR_HP];
    pack.data.remainingHP = result.remainingHP;
    pack.data.damageInflicted = result.damageInflicted;
    pack.data.canAfflict = true;
	}
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
  var remainingHP;
  var finalDamage = damage;

  if (damage <= 0)
  {
    return 0;
  }

	if (t[keys.AB_LIST][keys.ABS.SHAPE.FIRST] || t[keys.AB_LIST][keys.ABS.SHAPE.SECOND])
	{
    remainingHP = remainingHP.lowerCap(getTotalShapeHP(false, true, t) * -1);
	}

  else remainingHP = (Math.floor(t[keys.CURR_HP]) - damage).lowerCap(t[keys.MAX_HP] * -1);

  if (finalDamage > remainingHP)
  {
    finalDamage = Math.abs((t[keys.MAX_HP] * -1) - Math.floor(t[keys.CURR_HP]));
  }

	t[keys.CURR_HP] = result.remainingHP;
  return finalDamage;
}

function heal(amount, setAt = false, t = this)
{
  var maxHP = getTotalHP(false, t);
  var damageHealed = amount;

	if (amnt <= 0)
	{
		return;
	}

	if (setAt === true)
	{
    damageHealed = t[keys.MAX_HP] - amount;
    t[keys.CURR_HP] = Math.floor(amount).cap(t[keys.MAX_HP]);
    return damageHealed;
	}

  keys.CURR_HP += Math.floor(amount);

	if (t[keys.CURR_HP] > maxHP)
	{
		if (t[keys.AB_LIST][keys.ABS.SHAPE.FIRST] != null)
		{
			//must return the total hp healed
      return revertShape(t[keys.AB_LIST][keys.ABS.SHAPE.FIRST], t[keys.CURR_HP] - maxHP, t);
		}

    damageHealed = maxHP - t[keys.CURR_HP];
		t[keys.CURR_HP] = maxHP;
	}

  return damageHealed;
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

  amount += getTotalReinvigoration(t);

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
	var protection;

	if (weapon[keys.PROP_LIST].includes(keys.PROPS.A_NEGATE) === true)
	{
		return 0;
	}

  protection = dfndr.getTtlProt(hitLoc, (weapon[keys.PROP_LIST].includes(keys.PROPS.MAGICAL) === true) ? true : false);

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

function damageCheck(weapon, pack, result)
{
  result.damageType = weapon.pickDamage();
  pack.data.damageType = result.damageType;

	if (result.damageType == keys.DMG_TYPE.WEB)
	{
		result.damage = data.actor[keys.SIZE];
    pack.data.damage = result.damage;
    return;
	}

  result.damageRoll = (result.damageType != keys.DMG_TYPE.POISON) ? dice.DRN() + weapon[keys.DMG] : weapon[keys.DMG];
	result.protectionRoll = getProtectionRoll(weapon, target, pack.data.hitLocation, result.damageType, t);
	result.difference = result.damageRoll - result.protectionRoll;

	if (weapon[keys.PROP_LIST].includes(keys.PROPS.CAPPED) === true && result.difference > 0)
	{
		result.damage = 1;
    data.pack.damage = 1;
		return;
	}

	ruleset.modifyDamage(pack, result, (weapon[ids.PROPS][ids.STUN]) ? true : false);
}
