
const dice = require("./dice.js");
//const affliction = require("./affliction.js");
const ruleset = require("./ruleset.js");
var formModule;
var slotsModule;
var content;
var area = require("./area.js");
var prototype;

module.exports =
{
  init: function(contentModule)
  {
    content = contentModule;
    formModule = require("./form.js").init(contentModule);
    slotsModule = require("./slots.js").init(contentModule);
    return this;
  },

  Character: function(data)
  {
    this.name = data.name;
    this.id = data.id;
    this.player = data.username;
    this.level = data.level;
    this.transitionPoints = data.transitionPoints;
    this.maxHP = data.maxHP;
    this.currentHP = data.currentHP;
    this.mr = data.mr;
    this.morale = data.morale;
    this.strength = data.strength;
    this.attack = data.attack;
    this.defence = data.defence;
    this.precision = data.precision;
    this.ap = data.ap;
    this.afflictions = data.afflictions;
    this.paths = data.paths;
    this.properties = data.properties;
    this.abilities = data.abilities;
    this.parts = data.parts;

    this.form = formModule.Form(data.form);
    this.formIndex = data.formIndex;

    for (var i = 0; i < data.formList.length; i++)
    {
      this.formList[i] = formModule.Form(data.formList[i]);
    }

    this.slots = slotsModule.Slots(data.slots);
    this.setBattleStatus();

    return this;
  }
}

prototype = module.exports.Character.prototype;

prototype.setBattleStatus = function()
{
  this.battle = {};
  this.battle.fatigue = 0;
  this.battle.status = {};
  this.battle.status.harassment = 0;
  this.battle.ap = this.getTotalAttribute("ap");
  this.battle.mp = this.getTotalAttribute("mp");
  this.battle.area = area.Area(0, 0, this.area().width, this.area().height);
}

prototype.readyForBattle = function()
{

}

prototype.giveEnemyData = function()
{
  var data = {};
  data.id = this.id;
  data.name = this.name;
  data.player = this.player;
  data.level = this.level;
  data.form = this.form.name;
  data.size = this.size();
  data.sizeType = this.sizeType();
  data.area = this.area();
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

prototype.postAttackData = function()
{

}

prototype.size = function()
{
  return this.form.size;
}

prototype.area = function()
{
  return this.form.area;
}

prototype.sizeType = function()
{
  return this.form.sizeType;
}

prototype.stepSize = function()
{
  return this.form.stepSize;
}

prototype.ignite = function(pack, result)
{
  var igniteChance = pack.data.damage * 5;
	var roll = Math.floor((Math.random() * 100)) + 1;

	if (roll > igniteChance)
	{
		return false;
	}

	if (pack.damageType === "fire")
	{
		this.battle.status.fire = true;
	}

	else if (pack.damageType === "cold")
	{
		this.battle.status.cold = true;
	}

  return true;
}

prototype.addFatigue = function(amount)
{
  var result = {fatigueAdded: amount, damage: 0};
  this.battle.status.fatigue += amount;

  if (this.battle.status.fatigue > 200)
  {
    result.fatigueAdded -= this.battle.status.fatigue - 200;
    result.fatigueDamage = Math.floor((this.battle.status.fatigue - 200) / 5);
    this.battle.status.fatigue = 200;
    this.reduceHP(result.fatigueDamage);
  }

  if (this.battle.status.fatigue >= 100)
  {
    delete this.battle.status.berserk;
    this.battle.status.berserk = true;
  }

  return result;
}

prototype.reduceHP = function(damage)
{
  var damageInflicted = damage.cap(this.currentHP);
  var changeShapeResult;

  this.currentHP -= damageInflicted;

  if (this.currentHP === 0 && this.formList.length > 0 && this.formIndex < this.formList.length - 1)
  {
    damageInflicted += woundedShape(damage - damageInflicted);
  }

  return damageInflicted;
}

prototype.woundedShape = function(damageCarried)
{
  var maxHP;
  var damageInflicted;

  this.formIndex++;
  this.form = this.formList[this.formIndex];
  maxHP = this.getTotalAttribute("maxHP");
  damageInflicted = damageCarried.cap(this.currentHP);

  this.currentHP = (this.currentHP - damageCarried).lowerCap(0);

  if (this.currentHP === 0 && this.formList.length > 0 && this.formIndex < this.formList.length - 1)
  {
    damageInflicted += this.woundedShape(damageCarried - damageInflicted);
  }

  updateSlots(this);
  return damageInflicted;
}

prototype.heal = function(amount)
{
  var maxHP = this.getTotalAttribute("maxHP");
  var result = {"damageHealed": (maxHP - this.currentHP).cap(amount), shiftedShapeName: null};
  var revertShapeResult;

  this.currentHP += Math.floor(amount);

	if (this.currentHP === maxHP && this.formList.length > 0 && this.formIndex > 0)
	{
		revertShapeResult = this.healedShape(this.currentHP - maxHP);
    result.damageHealed += revertShapeResult.damageHealed;
    result.shiftedShapeName = revertShapeResult.shiftedShapeName;
	}

  return damageHealed;
}

prototype.healedShape = function(healingCarried)
{
  var maxHP;
  var result;

  this.formIndex--;
  this.form = this.formList[this.formIndex];
  maxHP = this.getTotalAttribute("maxHP")
  result = {"damageHealed": healingCarried.cap(maxHP - this.currentHP), shiftedShapeName: this.form.name};

  this.currentHP += result.damageHealed;

  if (this.currentHP === maxHP && this.formList.length > 0 && this.formIndex > 0)
  {
    var nextResult = this.healedShape(healingCarried - result.damageHealed);
    result.damageHealed += nextResult.damageHealed;
    result.shiftedShapeName = nextResult.shiftedShapeName;
  }

  updateSlots(this);
  return result;
}

prototype.updateSlots = function()
{
  for (var key in this.form.slots)
  {
    var charTotal = this.slots[key].total;
    var formTotal = this.form.slots[key].total || 0;

    if (formTotal === charTotal)
    {
      continue;
    }

    else if (formTotal === 0)
    {
      delete this.slots[key];
    }

    else if (formTotal > charTotal)
    {
      this.slots[key].free += formTotal - charTotal;
    }

    else if (formTotal < charTotal)
    {
      /******Will be added whenever we decide to include shapeshifting that can turn
      *******a form into another one with the same slot type, but in less quantities,
      *******since at the moment this NEVER happens.********************************/

      //droppedItems = droppedItems.concat(this.slots.reduceSlots(key, formTotal));
    }
  }
}

prototype.reduceFatigue = function(amount)
{
  var originalFat;
  var fatigueReduced = amount;

  if (this.battle == null || this.battle.status.fatigue <= 0 || amount <= 0)
	{
		this.battle.status.fatigue = 0;
		return 0;
	}

  if (amount > this.battle.status.fatigue)
  {
    fatigueReduced -= amount - this.battle.status.fatigue;
  }

  fatigueReduced = Math.abs(amount - (this.battle.status.fatigue.lowerCap(0) - amount));
	originalFat = this.battle.status.fatigue;
	this.battle.status.fatigue = (this.battle.status.fatigue - amount).lowerCap(0);

	if (this.battle.status.fatigue < 100 && originalFat >= 100)
	{
		delete this.battle.status.unconscious;
	}

  return fatigueReduced;
}

prototype.reinvigorate = function(amount)
{
  var originalFat;

  if (this.battle == null)
	{
		return 0;
	}

  amount += this.getTotalAbility("reinvigoration");

	if (this.battle.status.fatigue >= 100)
	{
		amount += 5; //Reinvigorate 5 if it's unconscious
	}

	if (amount > 0)
	{
		return this.reduceFatigue(amount);
	}

  else return 0;
}

prototype.getTotalProtection = function(hitLocation)
{
  return getTotalArmor(hitLocation) + getTotalNaturalArmor(hitLocation) + getTotalAbility("invulnerability");
}

prototype.getProtectionRoll = function(weapon, target, hitLocation, damageType)
{
	var armor = target.getTotalArmor(hitLocation);
  var natural = target.getTotalNaturalArmor(hitLocation);
  var invulnerability = target.getTotalAbility("invulnerability");

	if (weapon.properties.includes("armorNegating") === true)
	{
		return 0;
	}

  if (weapon.properties.includes("magical") === true)
  {
    //loses invulnerability protection
    invulnerability = 0;
  }

	if (damageType == "pierce")
	{
		armor = Math.floor(armor * 0.8);
    natural = Math.floor(natural * 0.8);
	}

	if (weapon.properties.includes("armorPiercing") === true)
	{
		armor = Math.floor(armor * 0.5);
    natural = Math.floor(natural * 0.5);
	}

	return dice.DRN() + armor + natural + invulnerability;
}

prototype.getElementalResistance = function(type)
{
  return getTotalAbility(type + "Resistance");
}

prototype.getTotalArmor = function(part)
{
  var total = 0;

  for (var key in this.slots)
  {
    var equipped = this.slots[key].equipped;

    for (var i = 0; i < equipped.length; i++)
    {
      var item = equipped[i];

      if (item.protection[part] == null || isNaN(item.protection[part]) === true)
      {
        continue;
      }

      total += item.protection[part];
    }
  }

  return total;
}

prototype.getTotalNaturalArmor = function(part)
{
  return (this.form.protection[part] || 0) + this.getTotalAbility("naturalArmor");
}

prototype.hasProperty = function(key)
{
  if (this.properties.includes(key) === true)
  {
    return true;
  }

  if (this.form.hasProperty(key) === true)
  {
    return true;
  }

  if (this.slots.hasProperty(key) === true)
  {
    return true;
  }

  return false;
}

prototype.getDualPenalty = function()
{
  var total = 0;

  for (var key in this.slots)
  {
    var equipped = this.slots[key].equipped;

    for (var i = 0; i < equipped.length; i++)
    {
      var item = equipped[i];

      if (item.damage == null || item.reach == null)
      {
        //not a weapon
        continue;
      }

      if (item.properties.includes("extra") === true)
      {
        //"Extra" weapons like
        continue;
      }

      total += item.reach;
    }
  }

  return (total - (this.abilities.ambidextrous || 0)).lowerCap(0);
}

prototype.getTotalAttribute = function(key)
{
  return (this.form[key] || 0) + (this[key] || 0) + this.slots.getTotalAbility(key + "Bonus");
}

prototype.getTotalAbility = function(key)
{
  var total = this.form.getTotalAbility(key) + this.slots.getTotalAbility(key);

  for (var ability in this.abilities)
  {
    if (key == ability && isNaN(this.abilities[ability]) === false)
    {
      total += this.abilities[ability];
    }
  }

  return total;
}

prototype.weaponTimesAvailable = function(id)
{
  return actor.slots.timesEquipped(id) + this.form.weaponTimesAvailable(id);
}

prototype.hasWeapon = function(id)
{
  if (this.slots.hasEquipped(id) === true)
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
  return this.slots.getItem(id) || this.form.getNaturalWeapon(id);
}
