
const fs = require('fs');
const dice = require("./dice.js");
const order = require("./resolution_orders.json");
var meleeStrategies;
var turnEndStrategies;

module.exports =
{
  init: function()
  {
    meleeStrategies = loadStrategies(order.melee);
    turnEndStrategies = loadStrategies(order.turnEnd);
  },

  move: function(actor, map, targetPosition)
  {
    var distanceMoved = actor.area.distanceToPoint(targetPosition);

    if (distanceMoved > actor.mp)
    {
      //too much movement
      throw new Error("This character cannot move this far.");
    }

    if (map.isOccupied(actor.area, actor.id) === true)
    {
      throw new Error("This space is already occupied by another character.");
    }

    if (map.isOutOfBounds(actor.area) === true)
    {
      throw new Error("You cannot move out of the boundaries of the battle map.");
    }

    actor.mpLeft -= distanceMoved;
    actor.area.setPosition(targetPosition);
  },

  melee: function(actor, targetPosition, weapon, battle)
  {
    var target = battle.map.getCharacterAt({x: targetPosition.x, y: targetPosition.y});
    var distance = actor.area.distanceToReach(target.area);
    var pack = {type: "melee", battle: battle, actor: actor, targetPosition: targetPosition, distance: distance, weapon: weapon, results: {}, data: {}};

    verifyMelee(actor, target, weapon, distance);
    resolveMelee(pack);

    return pack.results;
  },

  ranged: function(actor, targetPosition, weapon, battle)
  {
    var target = battle.map.getCharacterAt({x: targetPosition.x, y: targetPosition.y});
    var distance = actor.area.distanceToReach(target.area);
    var pack = {type: "ranged", battle: battle, actor: actor, targetPosition: targetPosition, distance: distance, weapon: weapon, data: {}}

    verifyRanged(actor, target, weapon, distance);
    resolveMelee(pack);
  },

  endTurn: function(pack)
  {
    var results = [];

    for (var i = 0; i < turnEndStrategies.length; i++)
    {
      results.push({});
      turnEndStrategies[i].apply(pack, results[i]);
    }

    return results;
  },

  calculateRequiredAPs: function(weapons, actor)
  {
    var apCost = 0;
    var weaponIDs = [];

    for (var i = 0; i < weapons.length; i++)
    {
      var timesAvailable = actor.weaponTimesAvailable(weapons[i].id);
      var timesUsed = weaponIDs.filter(function(id) { return id === weapons[i].id; }).length;
      apCost += weapons[i].apCost;

      if (weaponIDs.length > 0 && timesUsed > 1 && timesUsed < timesAvailable)
      {
        //combos, each *new* *unique* attack in the same sequence reduces its cost by 1
        //check the number of this attack available in the character and compare
        //it to the number of times it's been already used in the weaponIDs
        apCost--;
      }

      weaponIDs.push(weapons[i].id);
    }

    return apCost;
  }
}

function loadStrategies(orderList)
{
  var arr = [];

  for (var i = 0; i < orderList.length; i++)
  {
    if (fs.existsSync("./server/strategies/" + orderList[i] + ".js") === false)
    {
      continue;
    }

    arr.push(require("./server/strategies/" + orderList[i] + ".js"));
  }

  return arr;
}

function verifyMelee(actor, target, weapon, distance)
{
  if (target == null)
  {
    throw new Error("The selected target is an empty tile.");
  }

  if (actor.player === target.player)
  {
    //wrong target (friendly)
    throw new Error("You cannot target one of your own characters.");
  }

  verifyMeleeWeapon(weapon, actor, target, distance);

  if (actor.apLeft < weapon.apRequired)
  {
    throw new Error(`Not enough APs to make these attacks. The total AP cost is ${reqAPs}, but this character only has ${actor.apLeft} left.`);
  }
}

function verifyRanged(actor, target, weapon, distance)
{
  if (target == null)
  {
    //wrong target
    throw new Error("The selected target is an empty tile.");
  }

  if (actor.player === target.player)
  {
    //wrong target (friendly)
    throw new Error("You cannot target one of your own characters.");
  }

  verifyRangedWeapon(weapon, actor, target, distance);

  if (actor.apLeft < weapon.apRequired)
  {
    throw new Error(`Not enough APs to make these attacks. The total AP cost is ${reqAPs}, but this character only has ${actor.apLeft} left.`);
  }
}

function resolveMelee(pack)
{
  var targets = pack.battle.map.getCharactersWithin(pack.targetPosition, pack.weapon.abilities.areaOfEffect);

  for (var i = 0; i < targets.length; i++)
  {
    var result;

    if (pack.results[targets[i].id] == null)
    {
      pack.results[targets[i].id] = [];
    }

    pack.target = targets[i];
    result = resolveAttack(pack);
    pack.results[targets[i].id].push(result);

    //check onHit
    if (pack.type === "melee" && result.attack.success === true && pack.weapon.onHit != null)
    {
      onHit(pack);
    }

    //check onDamage
    if (pack.type === "melee" && result.damage.success === true && pack.weapon.onDamage != null)
    {
      onDamage(pack);
    }

    //cleave
    if (result.damage.success === true && pack.data.targetKO === true &&
        pack.data.finalDamage > pack.data.damageInflicted)
    {
      cleave(pack);
    }
  }
}

function resolveAttack(pack)
{
  var result = {};

  for (var i = 0; i < meleeStrategies.length; i++)
  {
    result[order.melee[i]] = {};
    meleeStrategies[i].apply(pack, result[order.melee[i]]);

    if (result[order.melee[i]].targetKO === true)
    {
      pack.data.targetKO = true;
      pack.battle.koActors[pack.actor.player].push(pack.actor.id);
      break;
    }

    else if (result[order.melee[i]].success === false)
    {
      break;
    }
  }

  //check if fatigue was applied or if loop broke out before
  if (result.fatigue == null)
  {
    result.fatigue = {};
    meleeStrategies[order.melee.length - 1].apply(pack, result.fatigue);
  }

  return result;
}

function onHit(pack)
{
  var onHitPack = {type: "onHit", battle: pack.battle, actor: pack.actor, targetPosition: pack.targetPosition, distance: 0, weapon: pack.weapon.onHit, results: pack.results, data: pack.data};

  try
  {
    verifyMelee(pack.actor, pack.target, pack.weapon.onHit, 0);
    resolveMelee(onHitPack);
  }

  catch(err)
  {

  }
}

function onDamage(pack)
{
  var onDamagePack = {type: "onDamage", battle: pack.battle, actor: pack.actor, targetPosition: pack.targetPosition, distance: 0, weapon: pack.weapon.onDamage, results: pack.results, data: pack.data};

  try
  {
    verifyMelee(pack.actor, pack.target, pack.weapon.onDamage, 0);
    resolveMelee(onDamagePack);
  }

  catch(err)
  {

  }
}

function cleave(pack)
{
  var cleavePack;
  var targetChosen;
  var cleaveTargets;

  if (pack.data.damageType !== "pierce" && pack.data.damageType !== "blunt" && pack.data.damageType !== "slash")
  {
    return;
  }

  else if (pack.data.damageType === "pierce")
  {
    cleaveTargets = pack.battle.map.getOppositeAdjacentCharacters(pack.actor.area, pack.target.area).filter(function(item)
    {
      return pack.actor.area.distanceToReach(item.area) <= pack.weapon.reach;
    });

    if (cleaveTargets.length < 1)
    {
      return;
    }
  }

  else if (pack.data.damageType === "blunt" || pack.data.damageType === "slash")
  {
    cleaveTargets = pack.battle.map.getSideAdjacentCharacters(pack.actor.area, pack.target.area).filter(function(item)
    {
      return pack.actor.area.distanceToReach(item.area) <= pack.weapon.reach;
    });

    if (cleaveTargets.length < 1)
    {
      return;
    }
  }

  targetChosen = cleaveTargets[Math.floor(Math.random() * cleaveTargets.length)];
  cleavePack = {type: "cleave", battle: pack.battle, actor: pack.actor, targetPosition: targetChosen.area.position(),
                distance: pack.actor.area.distanceToReach(targetChosen.area), weapon: pack.weapon, results: pack.results, data: pack.data};

  try
  {
    verifyMelee(pack.actor, pack.target, pack.weapon.onDamage, cleavePack.distance);
    resolveMelee(cleavePack);
  }

  catch(err)
  {

  }
}

function verifyMeleeWeapon(weapon, actor, target, distance)
{
  if (weapon == null)
  {
    throw new Error("The weapon id " + weapon + " is not valid or equipped on this character.");
  }

  else if (weapon.range < distance)
  {
    throw new Error("This weapon does not have enough range to hit this target.");
  }

  else if (weapon.categories.includes("melee") === false)
  {
    throw new Error("This weapon is not a melee weapon.");
  }

  else if (weapon.properties.includes("requiresLife") === true && target.properties.includes("lifeless") === true)
  {
    throw new Error("This weapon does not work against lifeless targets.");
  }

  else if (weapon.properties.includes("requiresMind") === true && target.properties.includes("mindless") === true)
  {
    throw new Error("This weapon does not work against mindless targets.");
  }
}

function verifyRangedWeapon(weapon, actor, target, distance)
{
  if (weapon == null)
  {
    throw new Error("The weapon id " + weapon + " is not valid or equipped on this character.");
  }

  else if (weapon.range < distance)
  {
    throw new Error("This weapon does not have enough range to hit this target.");
  }

  else if (weapon.categories.includes("ranged") === false)
  {
    throw new Error("This weapon is not a ranged weapon.");
  }

  else if (weapon.properties.includes("requiresLife") === true && target.properties.includes("lifeless") === true)
  {
    throw new Error("This weapon does not work against lifeless targets.");
  }

  else if (weapon.properties.includes("requiresMind") === true && target.properties.includes("mindless") === true)
  {
    throw new Error("This weapon does not work against mindless targets.");
  }
}
