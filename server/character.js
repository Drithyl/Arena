
const dice = require("./dice.js");
//const affliction = require("./affliction.js");
const ruleset = require("./ruleset.js");
const formModule = require("./form.js");
const slotsModule = require("./slots.js");
var circle = require("./math/circle.js");
var prototype;

module.exports =
{
  create: function(data)
  {
    //Required values, whether it's a new character or a revived one
    this.name = data.name;
    this.id = data.id;
    this.player = data.username;
    this.maxHP = data.maxHP;
    this.mr = data.mr;
    this.morale = data.morale;
    this.strength = data.strength;

    //Optional values; new characters will only have the default values here,
    //whereas revived characters will load their own
    this.level = data.level || 0;
    this.transitionPoints = data.transitionPoints || 0;
    this.currentHP = data.currentHP || this.getTotalAttribute("maxHP");
    this.attack = data.attack || 0;
    this.defence = data.defence || 0;
    this.precision = data.precision || 0;
    this.ap = data.ap || 0;
    this.mp = data.mp || 0;
    this.afflictions = data.afflictions || null;
    this.paths = data.paths || null;
    this.properties = data.properties || null;
    this.abilities = data.abilities || null;

    //Temporary values (battle-related values) that will always be at a default
    //state when the character is loaded up
    this.fatigue = 0;
    this.statusEffects = {harassment: 0};
    this.apLeft = this.getTotalAttribute("ap");
    this.mpLeft = this.getTotalAttribute("mp");
    this.area = circle.create(0, 0, this.size());

    //Form-related values. The form itself will always come with data from
    //the character_creator.js or simply the loaded data, and will be
    //revived with the appropriate functions in the formModule
    this.formIndex = data.formIndex || 0;
    this.form = formModule.create(data.form);

    for (var i = 0; i < data.formList.length; i++)
    {
      this.formList[i] = formModule.create(data.formList[i]);
    }

    //Slots object. A new character will come with a null data.slots,
    //in which case the slotsModule will create a new object with
    //the form's default values. Otherwise it will load up the data
    //from data.slots
    this.slots = slotsModule.create(this, data.slots);
  }
}

prototype = module.exports.create.prototype;

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
  data.position = {x: this.area.x, y: this.area.y};
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

prototype.sizeType = function()
{
  return this.form.sizeType;
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
		this.statusEffects.fire = true;
	}

	else if (pack.damageType === "cold")
	{
		this.statusEffects.cold = true;
	}

  return true;
}

prototype.addFatigue = function(amount)
{
  var result = {fatigueAdded: amount, damage: 0};
  this.fatigue += amount;

  if (this.fatigue > 200)
  {
    result.fatigueAdded -= this.fatigue - 200;
    result.fatigueDamage = Math.floor((this.fatigue - 200) / 5);
    this.fatigue = 200;
    this.reduceHP(result.fatigueDamage);
  }

  if (this.fatigue >= 100)
  {
    delete this.statusEffects.berserk;
    this.statusEffects.berserk = true;
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

  this.slots.update();
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

  this.slots.update();
  return result;
}

prototype.reduceFatigue = function(amount)
{
  var originalFat;
  var fatigueReduced = amount;

  if (this.fatigue == null || this.fatigue <= 0 || amount <= 0)
	{
		this.fatigue = 0;
		return 0;
	}

  if (amount > this.fatigue)
  {
    fatigueReduced -= amount - this.fatigue;
  }

  fatigueReduced = Math.abs(amount - (this.fatigue.lowerCap(0) - amount));
	originalFat = this.fatigue;
	this.fatigue = (this.fatigue - amount).lowerCap(0);

	if (this.fatigue < 100 && originalFat >= 100)
	{
		delete this.statusEffects.unconscious;
	}

  return fatigueReduced;
}

prototype.reinvigorate = function(amount)
{
  var originalFat;

  if (this.fatigue == null)
	{
		return 0;
	}

  amount += this.getTotalAbility("reinvigoration");

	if (this.fatigue >= 100)
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
